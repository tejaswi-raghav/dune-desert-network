export type PacketType = 'TEXT' | 'SOS' | 'CHECK_IN' | 'TELEMETRY' | 'ALERT' | 'ACK';
export type PacketStatus = 'CREATED' | 'QUEUED' | 'TRANSMITTING' | 'RELAYED' | 'DELIVERED' | 'ACKNOWLEDGED' | 'RETRYING' | 'DEFERRED' | 'EXPIRED' | 'DROPPED' | 'FAILED';
export interface SimNode {
  id: string; name: string; kind: 'worker' | 'radio' | 'relay' | 'vehicle' | 'clinic' | 'base' | 'gateway';
  x: number; y: number; battery: number; capacityWh: number; online: boolean; range: number;
  queue: string[]; lastContact: number | null; lowPower: boolean; speed: number;
  waypoints?: {x:number;y:number}[]; waypointIndex?: number;
}
export interface Packet {
  packetId:string; messageId:string; source:string; destination:string; payload:string; type:PacketType;
  priority:number; createdAt:number; ttl:number; TTL:number; maxHops:number; sequence:number; sizeBytes:number;
  attempts:number; integrity:string; status:PacketStatus; holder:string; route:string[]; hops:number;
  deliveredAt?:number; acknowledgedAt?:number; ackFor?:string; reason:string;
}
export interface SimEvent { id:number; time:number; type:string; packetId?:string; nodeId?:string; from?:string; to?:string; detail:string; }
export interface Link {source:string;target:string;quality:number;rssi:number;snr:number;distance:number;available:boolean;}
export interface SimConfig {
  seed:number; interference:number; weatherAttenuation:number; quality:number; queueCapacity:number;
  dutyCycle:number; bandwidth:number; spreadingFactor:number; codingRate:number; txPowerW:number; rxPowerW:number;
  sleepPowerW:number; maxRetries:number; policy:'dune'|'constrained'|'flooding'; messageRate:number;
}
export interface Metrics {
  sent:number; delivered:number; acknowledged:number; deliveryRate:number; emergencyDeliveryRate:number;
  medianLatency:number; p95Latency:number; backlog:number; expired:number; dropped:number; retries:number;
  averageHops:number; energyWh:number; firstSOSLatency:number|null; byPriority:{priority:number;sent:number;delivered:number}[];
  latencySamples:number[];
}
export interface Scenario {id:string;name:string;description:string;duration:number;nodes:SimNode[];config?:Partial<SimConfig>;initialMessages?:SendInput[];}
export interface SendInput {source:string;destination:string;payload:string;type?:Exclude<PacketType,'ACK'>;priority?:number;ttl?:number;maxHops?:number;}
export interface Snapshot {time:number;nodes:SimNode[];packets:Packet[];events:SimEvent[];links:Link[];metrics:Metrics;config:SimConfig;scenarioId:string;}
