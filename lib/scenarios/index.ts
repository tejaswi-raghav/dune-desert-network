import type {Scenario,SimNode} from '../simulation/types';
export const SCENARIOS=[
  {id:'success',name:'A · Simple success',description:'Two independent modeled radios exchange a check-in and a destination-generated ACK.',duration:20},
  {id:'weak',name:'B · Weak link',description:'Seeded interference causes missing link ACKs, retries and delayed delivery.',duration:90},
  {id:'partition',name:'C · Total partition',description:'No radio path. SOS remains UNDELIVERED in the source queue until contact returns or TTL expires.',duration:60},
  {id:'mule',name:'D · Data mule rescue',description:'A truck carries an SOS across a complete partition; the return journey carries the end-to-end ACK.',duration:180},
  {id:'solar',name:'E · Solar relay failure',description:'A nearly empty relay depletes. A queued message loses its only path and stays pending.',duration:60},
] as const;
function node(id:string,name:string,kind:SimNode['kind'],x:number,y:number,range=32):SimNode{return {id,name,kind,x,y,range,battery:100,capacityWh:12,online:true,queue:[],lastContact:null,lowPower:false,speed:0};}
export function createScenario(id:string,seed=42):Scenario {
  const meta=SCENARIOS.find(s=>s.id===id);if(!meta)throw new Error(`Unknown scenario: ${id}`);
  const worker=node('worker','Field crew 01','worker',15,55),base=node('base','Rescue base','base',85,45);
  const s:Scenario={...meta,nodes:[worker,base],config:{seed},initialMessages:[]};
  if(id==='success'){base.x=40;base.y=55;s.config={seed,quality:1};s.initialMessages=[{source:'worker',destination:'base',payload:'Crew safe. Water remaining: 4 L.',type:'CHECK_IN',priority:2}];}
  if(id==='weak'){base.x=40;base.y=55;s.config={seed,quality:.30,maxRetries:12};s.initialMessages=[{source:'worker',destination:'base',payload:'Need water at manual waypoint D-17.',type:'TEXT',priority:2}];}
  if(id==='partition')s.initialMessages=[{source:'worker',destination:'base',payload:'SOS. Vehicle disabled. Two people. Manual grid D-17.',type:'SOS',priority:0}];
  if(id==='mule'){
    const truck=node('truck','Supply truck · mule','vehicle',16,55,24);truck.speed=1.25;truck.waypoints=[{x:85,y:45},{x:16,y:55}];truck.waypointIndex=0;
    const relay=node('relay','Solar repeater','relay',70,45,25);base.range=25;worker.range=24;s.nodes=[worker,truck,relay,base];
    s.initialMessages=[{source:'worker',destination:'base',payload:'SOS. Heat illness. Two workers. Manual grid D-17.',type:'SOS',priority:0,ttl:300}];
  }
  if(id==='solar'){
    worker.x=20;base.x=78;worker.y=base.y=50;worker.range=base.range=31;
    const relay=node('relay','Solar relay · depleted pack','relay',49,50,31);relay.capacityWh=.0001;relay.battery=12;
    s.nodes=[worker,relay,base];s.config={seed,dutyCycle:.01};s.initialMessages=[{source:'worker',destination:'base',payload:'Clinic battery warning. Request support.',type:'ALERT',priority:1}];
  }
  return s;
}
