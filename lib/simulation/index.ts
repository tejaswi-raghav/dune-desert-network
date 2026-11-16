export * from './types';
import type {Packet,PacketType,SendInput,SimConfig,SimNode,Scenario,SimEvent,Snapshot,Link,Metrics} from './types';

export const DEFAULT_CONFIG:SimConfig={seed:42,interference:0,weatherAttenuation:0,quality:1,queueCapacity:24,dutyCycle:0.1,bandwidth:125000,spreadingFactor:9,codingRate:1,txPowerW:0.4,rxPowerW:0.05,sleepPowerW:0.001,maxRetries:8,policy:'dune',messageRate:0};
/** Semtech LoRa explicit-header airtime approximation. CRC on; CR=1 means 4/5. Seconds. */
export function airtime(size:number,sf=9,bw=125000,cr=1):number {
  const symbol=2**sf/bw, lowRate=symbol>=0.016?1:0;
  const symbols=8+Math.max(Math.ceil((8*size-4*sf+28+16)/(4*(sf-2*lowRate)))*(cr+4),0);
  return (8+4.25+symbols)*symbol;
}
function hash(s:string):string{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');}
const finished=(p:Packet)=>['EXPIRED','DROPPED','FAILED','ACKNOWLEDGED'].includes(p.status);
type Flight={packetId:string;from:string;to:string;end:number;success:boolean;};
export class Simulation {
  time=0; nodes:SimNode[]; packets:Packet[]=[]; events:SimEvent[]=[]; config:SimConfig; scenarioId:string;
  private randomState:number; private sequence=0; private eventSequence=0; private flights:Flight[]=[];
  private seen:Record<string,string[]>={}; private ready:Record<string,number>={}; private retry:Record<string,number>={};
  private energyWh=0; private retryCount=0; private trafficAccumulator=0; private initialNodes:SimNode[];
  constructor(scenario:Scenario){
    this.nodes=structuredClone(scenario.nodes);this.initialNodes=structuredClone(scenario.nodes);this.scenarioId=scenario.id;
    this.config={...DEFAULT_CONFIG,...scenario.config};this.randomState=this.config.seed>>>0;
    for(const n of this.nodes){this.seen[n.id]=[];this.ready[n.id]=0;}
    this.log('SCENARIO',`${scenario.name}. Synthetic coordinates; time in simulated seconds.`);
    for(const m of scenario.initialMessages??[])this.send(m);
  }
  private random(){this.randomState=(this.randomState+0x6D2B79F5)>>>0;let t=this.randomState;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
  private log(type:string,detail:string,p?:Packet,nodeId?:string,from?:string,to?:string){this.events.push({id:++this.eventSequence,time:this.time,type,detail,packetId:p?.packetId,nodeId,from,to});if(this.events.length>20000)this.events.splice(0,this.events.length-20000);}
  private node(id:string){const n=this.nodes.find(n=>n.id===id);if(!n)throw new Error(`Unknown node: ${id}`);return n;}
  send(input:SendInput):Packet{return this.create({...input,type:input.type??'TEXT'});}
  private create(input:Omit<SendInput,'type'>&{type:PacketType;ackFor?:string}):Packet {
    if(this.packets.length>=10000)throw new Error('Demo packet limit reached. Export and reset the scenario.');
    const source=this.node(input.source);this.node(input.destination);
    if(!input.payload.trim())throw new Error('A message is required.');
    const size=new TextEncoder().encode(input.payload).length+24;
    if(size>200)throw new Error('Payload exceeds 176 UTF-8 bytes (200 including modeled header).');
    if(input.priority!==undefined&&(!Number.isInteger(input.priority)||input.priority<0||input.priority>3))throw new Error('Priority must be P0–P3.');
    if(input.ttl!==undefined&&(!Number.isFinite(input.ttl)||input.ttl<=0))throw new Error('TTL must be positive.');
    if(input.maxHops!==undefined&&(!Number.isInteger(input.maxHops)||input.maxHops<1||input.maxHops>64))throw new Error('maxHops must be 1–64.');
    const id=++this.sequence;
    const p:Packet={packetId:`PKT-${String(id).padStart(4,'0')}`,messageId:`MSG-${String(id).padStart(4,'0')}`,source:input.source,destination:input.destination,payload:input.payload,type:input.type,priority:input.priority??(input.type==='SOS'?0:3),createdAt:this.time,ttl:input.ttl??300,TTL:input.ttl??300,maxHops:input.maxHops??12,sequence:id,sizeBytes:size,attempts:0,integrity:hash(input.payload),status:'CREATED',holder:input.source,route:[input.source],hops:0,reason:'Packet created',ackFor:input.ackFor};
    this.packets.push(p);this.log('CREATED',`${p.type} · P${p.priority} · ${size} bytes · integrity ${p.integrity} (non-cryptographic checksum)`,p,source.id);
    this.seen[source.id].push(p.packetId);
    if(source.queue.length>=this.config.queueCapacity){p.status='DROPPED';p.reason='Source buffer full';this.log('DROPPED',p.reason,p,source.id);}
    else {source.queue.push(p.packetId);p.status='QUEUED';p.reason='Accepted into local queue; recipient has not received it';this.log('QUEUED',p.reason,p,source.id);}
    return p;
  }
  get links():Link[]{
    const links:Link[]=[];
    for(let i=0;i<this.nodes.length;i++)for(let j=i+1;j<this.nodes.length;j++){
      const a=this.nodes[i],b=this.nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y),range=Math.min(a.range,b.range),ratio=d/range;
      const q=Math.max(0,Math.min(1,this.config.quality*(1-this.config.interference)*(1-this.config.weatherAttenuation)*Math.max(0,1-0.15*ratio**2)));
      links.push({source:a.id,target:b.id,distance:d,quality:q,rssi:-85-35*Math.min(2,ratio),snr:10-18*ratio,available:a.online&&b.online&&a.battery>0&&b.battery>0&&d<=range&&q>0&&(!a.lowPower||this.time%20<5)&&(!b.lowPower||this.time%20<5)});
    }return links;
  }
  private neighbors(id:string):{node:SimNode;link:Link}[]{return this.links.filter(l=>l.available&&(l.source===id||l.target===id)).map(l=>({node:this.node(l.source===id?l.target:l.source),link:l}));}
  private distanceTo(start:string,end:string):number {
    const seen=new Set([start]),queue:[string,number][]=[[start,0]];
    while(queue.length){const [id,d]=queue.shift()!;if(id===end)return d;for(const n of this.neighbors(id))if(!seen.has(n.node.id)){seen.add(n.node.id);queue.push([n.node.id,d+1]);}}return Infinity;
  }
  private choose(p:Packet,from:SimNode):{node:SimNode;link:Link;reason:string}|null {
    const opts=this.neighbors(from.id).filter(o=>!this.seen[o.node.id].includes(p.packetId));
    const direct=opts.find(o=>o.node.id===p.destination);if(direct)return {...direct,reason:'Destination in modeled range'};
    const connected=opts.map(o=>({...o,d:this.distanceTo(o.node.id,p.destination)})).filter(o=>Number.isFinite(o.d)).sort((a,b)=>a.d-b.d||b.link.quality-a.link.quality||a.node.id.localeCompare(b.node.id));
    if(connected.length)return {...connected[0],reason:'Fewest currently reachable hops; quality breaks ties'};
    if(this.config.policy==='constrained')return null;
    const mule=opts.find(o=>o.node.kind==='vehicle');if(mule)return {...mule,reason:'Store-and-forward: mobile carrier contact; destination delivery remains unconfirmed'};
    if(this.config.policy==='flooding'&&opts.length)return {...opts[0],reason:'Baseline epidemic copy to unseen neighbor'};
    return null;
  }
  /** Advance in fixed 250ms event slots. Transmission completion uses LoRa airtime, never animation timing. */
  step(seconds=1){if(!Number.isFinite(seconds)||seconds<0||seconds>86400)throw new Error('Advance must be between 0 and 86400 seconds.');let remaining=seconds;while(remaining>0.000001){const dt=Math.min(.25,remaining);this.tick(dt);remaining-=dt;}return this.snapshot;}
  run(seconds:number){return this.step(seconds);}
  private tick(dt:number){
    this.time=Math.round((this.time+dt)*1e6)/1e6;
    for(const n of this.nodes){
      if(!n.online||n.battery<=0)continue;
      if(n.waypoints?.length&&n.speed>0){const idx=n.waypointIndex??0,target=n.waypoints[idx],d=Math.hypot(target.x-n.x,target.y-n.y),move=n.speed*dt;if(d<=move){n.x=target.x;n.y=target.y;n.waypointIndex=(idx+1)%n.waypoints.length;}else{n.x+=(target.x-n.x)/d*move;n.y+=(target.y-n.y)/d*move;}}
      this.consume(n,(n.lowPower&&this.time%20>=5?this.config.sleepPowerW:this.config.rxPowerW)*dt/3600);
    }
    const completed=this.flights.filter(f=>f.end<=this.time);this.flights=this.flights.filter(f=>f.end>this.time);
    for(const f of completed)this.finish(f);
    for(const p of this.packets){if(!finished(p)&&p.deliveredAt===undefined&&this.time-p.createdAt>=p.ttl){p.status='EXPIRED';p.reason='TTL expired before destination delivery';this.removeAll(p.packetId);this.log('EXPIRED',p.reason,p,p.holder);}}
    if(this.config.messageRate>0&&this.packets.length<9990){this.trafficAccumulator+=dt*this.config.messageRate/60;while(this.trafficAccumulator>=1&&this.packets.length<9990){this.trafficAccumulator--;const a=this.nodes[0],b=this.nodes.find(n=>n.kind==='base')??this.nodes.at(-1)!;this.send({source:a.id,destination:b.id,payload:'Routine field check-in',type:'CHECK_IN',priority:3});}}
    // One shared half-duplex collision domain. Serial scheduling models contention conservatively.
    if(this.flights.length)return;
    const candidates=this.nodes.filter(n=>n.online&&n.battery>0&&this.time>=(this.ready[n.id]??0)&&(!n.lowPower||this.time%20<5)).flatMap(n=>n.queue.map(id=>({n,p:this.packets.find(p=>p.packetId===id)!}))).filter(o=>o.p&&!finished(o.p)&&o.p.deliveredAt===undefined);
    candidates.sort((a,b)=>this.rank(a.p)-this.rank(b.p)||a.p.createdAt-b.p.createdAt||a.p.sequence-b.p.sequence);
    for(const {n,p} of candidates){
      if(p.hops>=p.maxHops){p.status='DROPPED';p.reason='Maximum hop count reached';this.removeAll(p.packetId);this.log('DROPPED',p.reason,p,n.id);continue;}
      const choice=this.choose(p,n);
      if(!choice){if(p.status!=='DEFERRED'){p.status='DEFERRED';p.reason='No eligible contact. Stored locally; UNDELIVERED.';this.log('DEFERRED',p.reason,p,n.id);}continue;}
      const duration=airtime(p.sizeBytes,this.config.spreadingFactor,this.config.bandwidth,this.config.codingRate);
      this.ready[n.id]=this.time+duration/this.config.dutyCycle;p.status='TRANSMITTING';p.holder=n.id;p.attempts++;p.reason=choice.reason;
      this.log('TRANSMITTING',`${choice.reason}. Airtime ${duration.toFixed(3)}s; link success probability ${(choice.link.quality*100).toFixed(0)}%.`,p,n.id,n.id,choice.node.id);
      this.consume(n,this.config.txPowerW*duration/3600);
      this.flights.push({packetId:p.packetId,from:n.id,to:choice.node.id,end:this.time+duration+choice.link.distance/299792458,success:this.random()<choice.link.quality});break;
    }
  }
  private rank(p:Packet){if(this.config.policy!=='dune')return 0;return Math.max(0,p.priority-Math.floor((this.time-p.createdAt)/30));}
  private consume(n:SimNode,wh:number){const actual=Math.min(n.battery/100*n.capacityWh,wh);this.energyWh+=actual;n.battery=Math.max(0,n.battery-actual/n.capacityWh*100);if(n.battery===0){n.online=false;this.log('BATTERY_DEPLETED','Radio unavailable: battery depleted. Stored queue retained.',undefined,n.id);}}
  private removeAll(id:string){for(const n of this.nodes)n.queue=n.queue.filter(x=>x!==id);}
  private finish(f:Flight){
    const p=this.packets.find(p=>p.packetId===f.packetId)!,a=this.node(f.from),b=this.node(f.to);
    if(finished(p)||p.deliveredAt!==undefined)return;
    if(f.end-p.createdAt>=p.ttl){p.status='EXPIRED';p.reason='TTL expired before transmission completed';this.removeAll(p.packetId);this.log('EXPIRED',p.reason,p,a.id);return;}
    const contact=this.links.find(l=>(l.source===a.id&&l.target===b.id)||(l.source===b.id&&l.target===a.id));
    if(!f.success||!contact?.available){p.status='RETRYING';p.reason='Link ACK absent; seeded loss or contact ended';const key=`${p.packetId}:${a.id}:${b.id}`;this.retry[key]=(this.retry[key]??0)+1;this.retryCount++;this.log('RETRYING',p.reason,p,a.id,a.id,b.id);if(this.retry[key]>=this.config.maxRetries){p.status='FAILED';p.reason='Retry budget exhausted';this.removeAll(p.packetId);this.log('FAILED',p.reason,p,a.id);}return;}
    a.lastContact=b.lastContact=this.time;
    if(this.seen[b.id].includes(p.packetId)){this.log('DUPLICATE_SUPPRESSED','Receiver already holds this packet ID; no second delivery',p,b.id,a.id,b.id);a.queue=a.queue.filter(id=>id!==p.packetId);return;}
    if(b.queue.length>=this.config.queueCapacity&&b.id!==p.destination){p.status='DEFERRED';p.reason='Receiver buffer full; sender retains packet';this.log('BUFFER_FULL',p.reason,p,a.id,a.id,b.id);return;}
    this.seen[b.id].push(p.packetId);p.hops++;p.route.push(b.id);p.holder=b.id;
    this.log('LINK_ACK','Next-hop reception only; not proof of recipient delivery',p,b.id,a.id,b.id);
    if(this.config.policy!=='flooding'||b.id===p.destination)a.queue=a.queue.filter(id=>id!==p.packetId);
    if(b.id===p.destination){
      this.removeAll(p.packetId);p.status='DELIVERED';p.deliveredAt=this.time;p.reason='Intended destination received payload; end-to-end ACK pending';this.log('DELIVERED',p.reason,p,b.id,a.id,b.id);
      if(p.type==='ACK'){
        const original=this.packets.find(o=>o.packetId===p.ackFor);
        if(original?.deliveredAt!==undefined){original.status='ACKNOWLEDGED';original.acknowledgedAt=this.time;original.reason='Destination-generated ACK returned to original sender';this.log('ACKNOWLEDGED',original.reason,original,b.id);}
      }else if(this.packets.length<10000)this.create({source:b.id,destination:p.source,payload:`ACK ${p.packetId}`,type:'ACK',priority:0,ttl:p.ttl,ackFor:p.packetId});
    }else{b.queue.push(p.packetId);p.status='RELAYED';p.reason=b.kind==='vehicle'?'Mobile carrier holds packet. Recipient delivery unconfirmed.':'Relay holds packet; recipient delivery unconfirmed.';this.log('RELAYED',p.reason,p,b.id,a.id,b.id);}
  }
  /** Inject an already-seen frame to demonstrate receiver duplicate semantics without redelivery. */
  receiveDuplicate(packetId:string,nodeId:string){const p=this.packets.find(p=>p.packetId===packetId);this.node(nodeId);if(!p)throw new Error('Unknown packet');if(this.seen[nodeId].includes(packetId))this.log('DUPLICATE_SUPPRESSED','Repeated packet ID discarded; no additional delivery',p,nodeId);else throw new Error('Node has not seen this packet.');}
  setNode(id:string,patch:Partial<SimNode>){const n=this.node(id);if(patch.battery!==undefined&&(!Number.isFinite(patch.battery)||patch.battery<0||patch.battery>100))throw new Error('Battery must be 0–100%.');for(const key of ['x','y','range','speed','capacityWh'] as const)if(patch[key]!==undefined&&!Number.isFinite(patch[key]))throw new Error(`Invalid ${key}`);if((patch.range!==undefined&&patch.range<=0)||(patch.speed!==undefined&&patch.speed<0)||(patch.capacityWh!==undefined&&patch.capacityWh<=0))throw new Error('Range and capacity must be positive; speed cannot be negative');Object.assign(n,patch,{id:n.id});this.log('NODE_CHANGED',`${n.name}: operator changed modeled state`,undefined,id);}
  configure(patch:Partial<SimConfig>){const c={...this.config,...patch};if(Object.entries(c).some(([k,v])=>k!=='policy'&&(typeof v!=='number'||!Number.isFinite(v)))||!['dune','constrained','flooding'].includes(c.policy)||c.dutyCycle<=0||c.dutyCycle>1||c.queueCapacity<1||c.queueCapacity>1000||!Number.isInteger(c.queueCapacity)||c.spreadingFactor<7||c.spreadingFactor>12||!Number.isInteger(c.spreadingFactor)||c.codingRate<1||c.codingRate>4||!Number.isInteger(c.codingRate)||c.bandwidth<7800||c.bandwidth>500000||c.quality<0||c.quality>1||c.interference<0||c.interference>1||c.weatherAttenuation<0||c.weatherAttenuation>1||c.messageRate<0||c.messageRate>600||c.maxRetries<1||c.maxRetries>100||!Number.isInteger(c.maxRetries)||c.rxPowerW<0||c.txPowerW<0||c.sleepPowerW<0)throw new Error('Invalid simulation settings');this.config=c;}
  get metrics():Metrics {
    const sent=this.packets.filter(p=>p.type!=='ACK'),delivered=sent.filter(p=>p.deliveredAt!==undefined),lat=delivered.map(p=>p.deliveredAt!-p.createdAt).sort((a,b)=>a-b),sos=sent.filter(p=>p.priority===0),sosDelivered=sos.filter(p=>p.deliveredAt!==undefined);
    const quantile=(q:number)=>lat.length?lat[Math.ceil((lat.length-1)*q)]:0;
    return {sent:sent.length,delivered:delivered.length,acknowledged:sent.filter(p=>p.acknowledgedAt!==undefined).length,deliveryRate:sent.length?delivered.length/sent.length:0,emergencyDeliveryRate:sos.length?sosDelivered.length/sos.length:0,medianLatency:quantile(.5),p95Latency:quantile(.95),backlog:this.nodes.reduce((n,o)=>n+o.queue.length,0),expired:sent.filter(p=>p.status==='EXPIRED').length,dropped:sent.filter(p=>p.status==='DROPPED'||p.status==='FAILED').length,retries:this.retryCount,averageHops:delivered.length?delivered.reduce((n,p)=>n+p.hops,0)/delivered.length:0,energyWh:this.energyWh,firstSOSLatency:sosDelivered.length?Math.min(...sosDelivered.map(p=>p.deliveredAt!-p.createdAt)):null,byPriority:[0,1,2,3].map(priority=>({priority,sent:sent.filter(p=>p.priority===priority).length,delivered:delivered.filter(p=>p.priority===priority).length})),latencySamples:lat};
  }
  get snapshot():Snapshot{return structuredClone({time:this.time,nodes:this.nodes,packets:this.packets,events:this.events,links:this.links,metrics:this.metrics,config:this.config,scenarioId:this.scenarioId});}
  exportJSON(){return JSON.stringify({version:1,time:this.time,nodes:this.nodes,packets:this.packets,events:this.events,config:this.config,scenarioId:this.scenarioId,randomState:this.randomState,sequence:this.sequence,eventSequence:this.eventSequence,flights:this.flights,seen:this.seen,ready:this.ready,retry:this.retry,energyWh:this.energyWh,retryCount:this.retryCount,trafficAccumulator:this.trafficAccumulator,initialNodes:this.initialNodes},null,2);}
  static fromJSON(json:string):Simulation {
    if(json.length>12000000)throw new Error('Snapshot exceeds 12 MB import limit');
    const s=JSON.parse(json),invalid=()=>{throw new Error('Unsupported or invalid scenario snapshot');};
    const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
    const string=(v:unknown)=>typeof v==='string'&&v.length<=2000;
    if(!s||s.version!==1||!Array.isArray(s.nodes)||!s.nodes.length||!Array.isArray(s.packets)||!Array.isArray(s.events)||!number(s.time)||!s.config||s.nodes.length>200||s.packets.length>10000||s.events.length>20000||!string(s.scenarioId))invalid();
    const ids=new Set<string>();
    for(const n of s.nodes){if(!n||!string(n.id)||!/^[a-zA-Z0-9_-]{1,64}$/.test(n.id)||['__proto__','prototype','constructor'].includes(n.id)||ids.has(n.id)||!string(n.name)||!['worker','radio','relay','vehicle','clinic','base','gateway'].includes(n.kind)||![n.x,n.y].every((v:unknown)=>typeof v==='number'&&Number.isFinite(v))||![n.battery,n.capacityWh,n.range,n.speed].every(number)||n.battery>100||n.capacityWh<=0||n.range<=0||typeof n.online!=='boolean'||typeof n.lowPower!=='boolean'||!Array.isArray(n.queue)||n.queue.length>1000||!n.queue.every(string)||!(n.lastContact===null||number(n.lastContact)))invalid();ids.add(n.id);if(n.waypoints!==undefined&&(!Array.isArray(n.waypoints)||n.waypoints.length>100||!n.waypoints.every((w:{x:unknown;y:unknown})=>w&&typeof w.x==='number'&&Number.isFinite(w.x)&&typeof w.y==='number'&&Number.isFinite(w.y))||!Number.isInteger(n.waypointIndex??0)||(n.waypointIndex??0)<0||(n.waypointIndex??0)>=Math.max(1,n.waypoints.length)))invalid();}
    const packetIds=new Set<string>();
    for(const p of s.packets){if(!p||!string(p.packetId)||packetIds.has(p.packetId)||!string(p.messageId)||!ids.has(p.source)||!ids.has(p.destination)||!ids.has(p.holder)||!string(p.payload)||!['TEXT','SOS','CHECK_IN','TELEMETRY','ALERT','ACK'].includes(p.type)||!['CREATED','QUEUED','TRANSMITTING','RELAYED','DELIVERED','ACKNOWLEDGED','RETRYING','DEFERRED','EXPIRED','DROPPED','FAILED'].includes(p.status)||![p.createdAt,p.ttl,p.TTL,p.maxHops,p.sequence,p.sizeBytes,p.attempts,p.hops,p.priority].every(number)||p.ttl<=0||p.priority>3||p.maxHops<1||p.maxHops>64||!Array.isArray(p.route)||!p.route.every((id:string)=>ids.has(id))||p.route.length>10000||p.integrity!==hash(p.payload)||(p.deliveredAt!==undefined&&!number(p.deliveredAt))||(p.acknowledgedAt!==undefined&&!number(p.acknowledgedAt)))invalid();packetIds.add(p.packetId);}
    for(const n of s.nodes)if(!n.queue.every((id:string)=>packetIds.has(id)))invalid();
    for(const e of s.events)if(!e||!number(e.id)||!number(e.time)||!string(e.type)||!string(e.detail)||(e.packetId!==undefined&&!packetIds.has(e.packetId)))invalid();
    if(!Array.isArray(s.flights)||s.flights.length>200||!s.flights.every((f:Flight)=>f&&packetIds.has(f.packetId)&&ids.has(f.from)&&ids.has(f.to)&&number(f.end)&&typeof f.success==='boolean'))invalid();
    if(!s.seen||!s.ready||!s.retry||Object.values(s.retry).some(v=>!number(v)))invalid();
    for(const id of ids)if(!Array.isArray(s.seen[id])||!s.seen[id].every((p:string)=>packetIds.has(p))||!number(s.ready[id]))invalid();
    if(![s.randomState,s.sequence,s.eventSequence,s.energyWh,s.retryCount,s.trafficAccumulator].every(number)||!Array.isArray(s.initialNodes))invalid();
    const sim=new Simulation({id:s.scenarioId,name:'Imported',description:'',duration:0,nodes:s.nodes,config:s.config});
    sim.configure(s.config);for(const n of s.nodes)sim.setNode(n.id,n);
    for(const key of ['time','nodes','packets','events','config','scenarioId','randomState','sequence','eventSequence','flights','seen','ready','retry','energyWh','retryCount','trafficAccumulator','initialNodes'] as const)(sim as unknown as Record<string,unknown>)[key]=s[key];return sim;
  }
}
