# Explicit assumptions and interpretation limits

As of 16 November 2026. Read alongside [RESEARCH.md](RESEARCH.md). Parameters below describe software behavior, not measured radio propagation or a selected legal configuration.

## Three separate systems

1. **Implemented:** independent modeled nodes within one browser simulation, each with identity, local packet queue, location, energy and connectivity. A packet delivered between these nodes is a genuine software state transition.
2. **Optional browser transport:** same-machine tabs or future WebRTC can exchange software messages, but neither supplies native LoRa nor proves device-to-device desert RF. No real peer transport is claimed unless separately implemented and tested.
3. **Future hardware:** phones connect by BLE/serial to approved radio nodes; radio firmware carries packets over authorized LoRa settings. A gateway may later bridge to authorized backhaul. None of that physical infrastructure has been field tested here.

## Simulator defaults

| Variable | Implementation assumption | Meaning/limit |
|---|---|---|
| Clock | Seconds of simulated time | Playback speed changes wall-clock presentation, not physical radio rate. |
| Geography | Synthetic coordinates 0–100 and abstract range units | Not kilometers, surveyed UAE terrain or installed infrastructure. |
| Modem | SF9, 125 kHz bandwidth, coding rate 4/5, CRC airtime estimate | Not a certified firmware/wire format; verify actual hardware overhead. |
| Channel | Shared, half-duplex, limited airtime | Simplified contention; not a full RF waveform/interference simulation. |
| Duty cycle | Default 10%, configurable | Illustrative scheduling constraint, **not UAE operating permission**. Choose lawful parameters only after regulatory confirmation. |
| Delivery probability | `quality × (1−interference) × (1−weather) × (1−0.15×(distance/range)^2)` within range | Seeded abstract success model. Not a calibrated propagation or sandstorm curve. |
| Energy | RX 0.05 W, TX 0.4 W, sleep 0.001 W | Illustrative whole-node placeholders; board/auxiliary measurements required. |
| Conservation | Receive/contact availability 5 seconds every 20 seconds | Demonstrates missed contact/latency tradeoff; not hardware wake synchronization. |
| Mobility | Synthetic waypoint traversal | Vehicle contact opportunities are modeled, not guaranteed schedules. |
| Persistence | Versioned JSON snapshot and IndexedDB latest snapshot | Browser storage can be cleared/evicted; no external durable backup. |

The energy worksheet has independently editable engineering inputs. Its default is 12 users/12 radios at $60 and 2 relays at $180; these are planning allowances. It assumes 10 W solar × 5 peak sun-hours × 0.55 net derating, 12 Wh storage × 0.8 usable × 0.8 temperature factor; costs/heat factors are not supplier verification. The alternative 20-user example in HARDWARE_BOM intentionally demonstrates different infrastructure sharing. The UI uses a 15% annual hardware-maintenance allowance; the BOM illustrates 10% plus unpriced visits. Neither is a measured maintenance contract.

## Packet semantics

- CREATED/QUEUED are local acceptance. TRANSMITTING consumes modeled airtime and energy. RELAYED means another node holds a copy; it proves no destination receipt.
- DELIVERED means the modeled destination received the payload. ACKNOWLEDGED requires a destination-generated ACK packet to traverse an actual subsequent modeled path back to the original sender.
- Link ACK indicates only a hop result; it does not replace the end-to-end ACK. Loss of a return path can leave a delivered message unacknowledged.
- Packet TTL and hop bounds limit lifetime; buffer limits can drop traffic. Integrity fields detect modeled accidental corruption, not malicious origin or tampering.
- A simulator has an omniscient inspection view for judges. A real remote sender cannot instantly know receiver delivery before evidence returns.

## Policy comparisons

DUNE uses deterministic priority/aging heuristics, not trained AI. P0 SOS, P1 medical/hazard, P2 check-in, P3 routine are application classes. Under finite load, aging improves fairness; no strict latency or starvation guarantee under unbounded offered traffic is claimed. Baselines are the actual implemented constrained route and simplified epidemic-copy flooding policies; the latter uses global hop accounting and is **not Meshtastic managed flooding**. Compare equal seeds, inputs, horizon and traffic. Short trials can censor delayed/expired packets; report denominator, simulation window and pending messages. Confidence intervals are appropriate only for repeated independent seeded trials and do not convey real-world reliability.

No policy is universally best: flooding can find an unexpected contact while a constrained next-hop policy waits; priority can delay routine traffic; mule carriage costs time, energy and transport resources. Synthetic performance is not a hardware benchmark or competitor ranking.

## Non-assumptions

There is no guaranteed delivery, emergency dispatch, clinical validation, satellite service, precise coverage forecast, lawful UAE RF profile, safety certification, completed desert thermal test, or native LoRa capability in the browser. Simulated patient readings and manual locations are demonstration data. Geolocation is optional and requires explicit browser consent; private field locations should never be published by default.

## Metric interpretation

Delivery rate counts original application messages with destination receipt over original messages sent; ACK packets are excluded from this denominator. Emergency rate uses P0 messages. Latency samples include delivered messages only, so low latency can coexist with poor delivery. The backlog counts queued copies (including ACKs and flooding copies), not unique undelivered user messages. Dropped includes retry-budget failures. Energy sums illustrative radio accounting, with receive baseline charged while online plus incremental transmit power; it is not a measured device-state trace. RSSI/SNR labels are synthetic diagnostic functions of abstract distance/range, not a link-budget calculation.

The comparison runs twelve fixed seeds per policy over one synthetic mule workload and 180 simulated seconds. Its displayed interval is a clipped normal approximation for the mean of trial delivery proportions (`mean ± 1.96 × standard_error`), not a calibrated prediction interval, exact small-sample interval or life-safety reliability statement. The reported comparison median latency is the **mean of each trial's median delivered latency**, not a pooled median. More scenarios and seeds are required before drawing general routing conclusions. Packet loss is independent seeded Bernoulli loss per attempt conditional on the model; correlated fading and spatial interference are omitted.

Additional fidelity limits: engine scheduling advances in fixed 250 ms slots; airtime is computed separately and completions are observed on slot boundaries. Modeled LINK_ACK is a receipt indication whose separate RF airtime is not charged, making overhead optimistic. End-to-end ACK packets do consume modeled airtime. A serialized shared collision domain models contention by queue scheduling, not simultaneous packet collisions. Propagation delay divides abstract map distance by the speed of light as a tiny illustrative term; because map units are not calibrated meters it must not be interpreted as a physical delay prediction. Application payloads are limited to 176 UTF-8 bytes plus a modeled 24-byte header. Histories retain the latest 20,000 events and cap the run at 10,000 total packets; export before resetting long sessions. Metrics may retain lifetime totals after old trace entries are pruned.
