import {Simulation} from '../simulation';
import {createScenario} from '../scenarios';
export interface ExperimentResult {policy:string;trials:number;deliveryRate:number;emergencyDeliveryRate:number;medianLatency:number;energyWh:number;deliveryCI:[number,number];}
/** Fixed seeds; confidence interval across trial-level delivery proportions (normal approximation). */
export function comparePolicies(trials=12):ExperimentResult[]{
  return (['flooding','constrained','dune'] as const).map(policy=>{
    const results=Array.from({length:trials},(_,i)=>{const s=createScenario('mule',101+i);s.config={...s.config,policy,quality:.8,queueCapacity:8,dutyCycle:.05};s.initialMessages=[];const sim=new Simulation(s);for(let j=0;j<8;j++)sim.send({source:'worker',destination:'base',payload:`Routine ${j}`,priority:3});sim.run(1);sim.send({source:'worker',destination:'base',payload:'SOS. Heat illness.',type:'SOS',priority:0});sim.run(179);return sim.metrics;});
    const mean=(xs:number[])=>xs.reduce((a,b)=>a+b,0)/xs.length,ds=results.map(m=>m.deliveryRate),avg=mean(ds),se=Math.sqrt(ds.reduce((n,x)=>n+(x-avg)**2,0)/Math.max(1,trials-1)/trials);
    return {policy,trials,deliveryRate:avg,emergencyDeliveryRate:mean(results.map(m=>m.emergencyDeliveryRate)),medianLatency:mean(results.map(m=>m.medianLatency)),energyWh:mean(results.map(m=>m.energyWh)),deliveryCI:[Math.max(0,avg-1.96*se),Math.min(1,avg+1.96*se)]};
  });
}
