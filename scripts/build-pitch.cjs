/* Rebuild with DUNE_LIVE_URL only after verifying that URL. All diagrams remain editable. */
const pptxgen = require('pptxgenjs');
const QRCode = require('qrcode');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..'), out=path.join(root,'pitch');
fs.mkdirSync(out,{recursive:true});
const C={bg:'0B0F13',sand:'D8B079',amber:'F5A623',ivory:'F6F1E8',muted:'A7ADB2',coral:'EF5B50',line:'33404A',green:'8BC7AB'};
const pptx=new pptxgen();pptx.layout='LAYOUT_WIDE';pptx.author='DUNE';pptx.subject='Desert Unified Network for Emergencies — simulation MVP';pptx.title='DUNE — No one left unheard';pptx.company='DUNE';pptx.lang='en-GB';
pptx.theme={headFontFace:'Aptos Display',bodyFontFace:'Aptos',lang:'en-GB'};
function text(s,t,x,y,w,h,size=20,color=C.ivory,bold=false,extra={}){s.addText(t,{x,y,w,h,fontFace:'Aptos',fontSize:size,color,bold,margin:0,breakLine:false,fit:'resize',...extra});}
function line(s,x1,y1,x2,y2,color=C.line,width=1.3,extra={}){s.addShape(pptx.ShapeType.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,line:{color,width,...extra}});}
function circle(s,x,y,r,color,label,sub){s.addShape(pptx.ShapeType.ellipse,{x:x-r,y:y-r,w:r*2,h:r*2,fill:{color:C.bg},line:{color,width:2}});text(s,label,x-r,y-.13,r*2,.28,15,color,true,{align:'center'});if(sub)text(s,sub,x-1.1,y+r+.2,2.2,.6,18,C.ivory,false,{align:'center'});}
function base(n,title){const s=pptx.addSlide();s.background={color:C.bg};text(s,'DUNE',.55,.3,1.2,.3,18,C.sand,true,{charSpacing:5});text(s,String(n).padStart(2,'0')+' / 07',11.9,.33,.85,.25,11,C.muted,false,{align:'right'});line(s,.55,.85,12.75,.85);if(title)text(s,title,.55,1.12,12.2,.75,34,C.ivory,true);return s;}
function notes(s,t,src=''){s.addNotes(t+'\n\nSOURCE / DISCLOSURE: '+src);}
function arrow(s,x,y,w,color=C.amber){line(s,x,y,x+w,y,color,2,{beginArrowType:'none',endArrowType:'triangle'});}
async function main(){
// 1: original editable vector topology, explicitly synthetic.
let s=base(1,'');
text(s,'DUNE',.55,1.42,8,1.65,96,C.ivory,true,{charSpacing:10});
text(s,'Desert Unified Network for Emergencies',.62,3.1,9,.5,23,C.sand);
text(s,'No signal. No internet.\nNo one left unheard.',.62,4.04,8.7,1.6,36,C.ivory,true);
text(s,'SIMULATION MVP  /  HARDWARE PATHWAY',.62,6.63,9,.3,12,C.muted,false,{charSpacing:2});
[[9.4,2.4],[11.6,3.5],[10.1,5.1]].forEach(([x,y],i)=>{if(i)line(s,9.4,2.4,x,y,C.sand);circle(s,x,y,.18,C.amber,'');});
notes(s,'0:00–0:20. DUNE stands for Desert Unified Network for Emergencies. Our promise is simple: no signal, no internet, no one left unheard. Today we demonstrate the communication logic in software. We do not claim that this website is radio infrastructure.','Original vector diagram; synthetic topology. No field-performance claims.');
// 2
s=base(2,'The communication gap');
text(s,'A field crew loses contact\nbeyond mobile coverage',.6,2.2,7.8,1.35,38,C.ivory,true);
text(s,'A worker needs help. The coordinator needs a location.\nA network partition can outlast a useful radio contact.',.6,4.0,8.1,1.1,23,C.muted);
text(s,'POWER  ·  HEAT  ·  DUST  ·  DISTANCE  ·  COST',.6,6.2,11.8,.4,17,C.sand,true,{charSpacing:1.3});
circle(s,10.4,2.8,.52,C.coral,'A','Field crew');circle(s,10.4,5.1,.52,C.sand,'B','Rescue base');line(s,10.4,4.2,10.4,4.5,C.coral,2,{dash:'dash'});
notes(s,'0:20–0:40. Consider a remote field crew. A worker is injured after leaving mobile coverage. A useful message is small: who, what, where, and urgency. The challenge is getting that message across a broken network while power, heat, dust and budget constrain every device. We use a synthetic scenario and invent no mortality statistics.','User-defined remote crew scenario. Environmental considerations: https://www.ti.com/lit/an/slyt365/slyt365.pdf and https://www.iec.ch/ip-ratings (see research).');
//3
s=base(3,'A network that can wait, then move');
const xs=[1.25,4.7,8.15,11.6];
['CREW','RELAY','TRUCK','BASE'].forEach((label,i)=>{circle(s,xs[i],3.28,.46,i===2?C.amber:C.sand,label);if(i<3)arrow(s,xs[i]+.7,3.28,2.05);});
['Small LoRa payloads','Solar-powered relay','Store, carry, forward','Recipient confirmation'].forEach((t,i)=>text(s,t,xs[i]-1.15,4.3,2.3,1,21,C.ivory,true,{align:'center'}));
text(s,'P0 SOS → P1 medical / hazard → P2 check-in → P3 routine',.65,6.1,12,.5,21,C.sand,false,{align:'center'});
notes(s,'0:40–1:05. Our proposed hardware network combines short low-power radio packets, solar relays and vehicles acting as data mules. A transparent scheduler gives distress messages priority, with aging for lower-priority traffic. LoRa is the physical modulation; this proposed peer-to-peer mesh is not LoRaWAN. Meshtastic already provides valuable mesh messaging. DUNE focuses on inspectable delayed-contact rescue and its failure conditions.','https://www.semtech.com/lora/what-is-lora ; https://lora-alliance.org/about-lorawan/ ; https://meshtastic.org/docs/overview/ ; DUNE custom simulator, not Meshtastic implementation.');
//4
s=base(4,'An SOS has two journeys');
const labels=['QUEUED','CARRIED','DELIVERED','ACKNOWLEDGED'];
labels.forEach((t,i)=>{text(s,String(i+1).padStart(2,'0'),.65+i*3.2,2.45,2,.7,46,i===3?C.green:C.amber,true);text(s,t,.65+i*3.2,3.4,2.65,.4,19,C.ivory,true);if(i<3)arrow(s,2.35+i*3.2,2.85,1.1);});
['Stored at worker','Truck accepts a copy','Base receives payload','ACK returns to worker'].forEach((t,i)=>text(s,t,.65+i*3.2,4.1,2.6,.85,21,C.muted));
line(s,1,5.6,12.2,5.6,C.green,2,{beginArrowType:'triangle'});text(s,'Return contact required: link ACK ≠ end-to-end ACK',.7,6.0,12,.6,24,C.green,true,{align:'center'});
notes(s,'1:05–1:30. The SOS waits in the worker’s local queue. The truck enters contact, accepts the message, carries it, and later forwards it to base. At that moment the recipient has received it. But the original worker still lacks proof. An acknowledgement must itself traverse available contacts back to the worker. If the truck never returns, delivery and acknowledgement remain different states. Packets expire, retries have limits, and no delivery is guaranteed.','DTN inspiration: https://www.rfc-editor.org/rfc/rfc9171.html . DUNE is a custom simulation, not a Bundle Protocol implementation and not formal custody transfer.');
//5 actual built screenshots required
s=base(5,'Working MVP: prove the failure, then recovery');
const shots=[path.join(out,'assets','partition.png'),path.join(out,'assets','mission-control.png')];
for(let i=0;i<2;i++){if(!fs.existsSync(shots[i]))throw new Error('Capture actual application screenshot first: '+shots[i]);s.addImage({path:shots[i],x:.6+i*6.35,y:2.05,w:6,h:3.75});}
text(s,'01  PARTITION: STORED, UNDELIVERED',.6,5.9,6,.4,18,C.coral,true);
text(s,'02  DATA MULE: DELIVERY + RETURN ACK',6.95,5.9,5.8,.4,18,C.green,true);
const live=process.env.DUNE_LIVE_URL;
if(live){const qr=await QRCode.toDataURL(live,{width:240,margin:1,color:{dark:'#0B0F13',light:'#F6F1E8'}});s.addImage({data:qr,x:11.8,y:6.35,w:.85,h:.85});text(s,live.replace('https://',''),.6,6.6,10.9,.35,17,C.sand);}
else text(s,'Local build verified · production publication awaits authorization',.6,6.6,11.8,.35,17,C.sand);
notes(s,'1:30–2:00. LIVE DEMO CUE: open Mission Control. Select Total partition; advance 30 seconds and show UNDELIVERED. Select Data mule rescue; run to completion. Select the SOS and inspect RELAYED, DELIVERED, and ACKNOWLEDGED in order. These are actual simulation events, not scripted delivery animations. The screenshot evidence comes from the built application. '+(live?'Scan the verified live URL.':'Production publication is not yet available; do not imply a deployed URL.'),'Actual DUNE screenshots captured from local tested application. URL is included only when verified after deployment.');
//6
s=base(6,'An engineered pilot, not a range promise');
text(s,'2–4 radios\n1 solar relay\n1 trained field crew',.65,2.2,5.5,2.25,35,C.ivory,true);
text(s,'Illustrative power model',7,2.15,5.5,.4,22,C.sand,true);
text(s,'0.05 W RX · 0.4 W TX · 0.001 W sleep\n95% RX / 1% TX / 4% sleep\n1.24 Wh/day before system overhead',7,2.85,5.6,1.45,21,C.ivory);
text(s,'10 W solar × 5 h × 0.55 = 27.5 Wh/day\n12 Wh × 0.80 × 0.80 ÷ 1.24 ≈ 6.2 days',7,4.55,5.6,.95,21,C.muted);
text(s,'$1,080 / 12 users = $90 each · planning estimate; phones/backhaul excluded',.65,5.7,12,.5,19,C.sand);
text(s,'TDRA permission · thermal cutoffs · dust/UV protection · emergency fallback',.65,6.45,12,.5,19,C.coral,true);
notes(s,'2:00–2:30. Start with two to four authorized radios, then a single solar relay, then a monitored field pilot. The energy panel exposes every input. These values are illustrative assumptions, not board measurements. Receive power and system overhead can dominate. A five-watt panel does not guarantee availability: dust, shading, heat and charge-controller limits matter. The live cost model separates radios, shared infrastructure, phones, maintenance and future backhaul. Spectrum approval, safe thermal charging, enclosure testing and an independent emergency fallback are prerequisites.','Power arithmetic uses explicit DUNE assumptions; not supplier performance claims. Supplier references and priced variants: docs/HARDWARE_BOM.md. TDRA: https://tdra.gov.ae/en/services/frequency-spectrum-authorization . No approved UAE band or field range asserted.');
//7
s=base(7,'Why DUNE matters');
text(s,'Inspectable resilience\nwhen contacts are intermittent',.65,2.0,11.6,1.25,38,C.ivory,true);
text(s,'WORKING CORE 30%     ORIGINALITY 25%     FEASIBILITY 20%',.65,3.75,12,.4,18,C.sand,true);
text(s,'Execution 15% · Demo 10%\nTargets for a pilot: delivery by priority, p95 delay, energy/day, ACK return rate',.65,4.5,11.8,.9,22,C.muted);
text(s,'Connectivity should not end\nwhere infrastructure does.',.65,5.9,11.9,1.0,32,C.ivory,true);
notes(s,'2:30–3:00. DUNE is strongest where a permanent connection is unavailable but a future contact is plausible. We can show where it works, where it retries, and where it fails. The roadmap is simulation, authorized radio bench tests, one-relay field test, and a trained-crew pilot. Judge us on measurable packet delivery, delay, energy use and returned acknowledgements. Connectivity should not end where infrastructure does.','Judging weights supplied by user. Pilot metrics are proposed success criteria; no field benchmarks claimed.');
await pptx.writeFile({fileName:path.join(out,'DUNE_Desert_Emergency_Network.pptx')});
console.log('Wrote exactly 7 editable slides. Live URL: '+(live||'not available; visibly disclosed'));
}
main().catch(e=>{console.error(e);process.exit(1)});
