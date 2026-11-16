# DUNE three-minute judge demonstration

Use the public production URL recorded in README. Start in a fresh browser profile or explicitly select each scenario. No real SOS or responder integration exists. Every time below is **presentation wall time**, except where explicitly marked simulated seconds.

| Wall time | Exact UI action | Evidence / narration |
|---|---|---|
| 0:00–0:20 | Open `/`; click **Enter mission control**. | “This is a software network simulator; future LoRa radios carry real traffic.” |
| 0:20–0:40 | **Scenario → A · Simple success**; focus **Replay timeline**, press **End**. | Inspect **ACKNOWLEDGED**, source worker → base, recipient timestamp and separate E2E ACK timestamp. |
| 0:40–1:00 | **Scenario → B · Weak link**; timeline **End**. | Event feed shows actual **RETRYING**; attempts derive from seeded losses. |
| 1:00–1:20 | **Scenario → C · Total partition**; timeline **End**. | Packet is **DEFERRED · UNDELIVERED**, delivery/ACK pending; delivery metric 0/1. No simulated path means no delivery. |
| 1:20–1:50 | **Scenario → D · Data mule rescue**; click **+10s** three times. | Around 30 simulated seconds the intended recipient has received the SOS; ACK is still pending at the original sender. Truck receipt alone was not delivery. Inspect route `worker → truck → relay → base`. |
| 1:50–2:10 | Focus **Replay timeline**, press **End**. | At 180 simulated seconds replay includes **ACKNOWLEDGED**. Default seed42 recipient receipt is 26s; ACK returns 94s. These values are scenario results, not real radio benchmarks. |
| 2:10–2:25 | **Scenario → E · Solar relay failure**; timeline **End**. | **BATTERY DEPLETED**, offline relay; intended destination remains undelivered. |
| 2:25–2:45 | Click **Engineering**. Change **Active users sharing kit**, then **Solar system derating**. | Live cost/user and energy formulas change. Default capital $1080/12=$90/user; planning allowances only, excluded costs visible. |
| 2:45–3:00 | Return **Mission control**; choose **Data mule rescue**; click **Export**. | Export contains actual nodes, packets, events, RNG and in-flight state. “Our next gate is an authorized 2–4 radio bench test, then one solar relay and a monitored pilot with a fallback.” |

## Optional extensions

- **Two-way conversation:** scenario A → **New packet** → Sender **base**, Recipient **worker**, Type **TEXT**, enter a reply → **Queue packet** → **+10s**. Choose the newly created packet in **Inspect packet**. This is a second independently addressed simulated message.
- **Restored contact:** scenario C, choose Rescue base inventory item. Change X to 35 and Y to55 in selected-node fields, then **+10s** twice. Do not move the preset timeline afterward: the preset timeline reconstructs original seeded placement. Export/import preserves edited placement.
- **Reproducible experiment:** **Resilience lab → Compare policies**. The UI runs 15 trials (three policies × five seeds); inspect actual delivery/SOS/delay results and small-sample interval caveats. Results can favor other policies under other inputs.
- **Offline:** first visit Mission Control online, wait for **Offline shell v1 ready**, then disable networking and reload canonical `/mission-control`. Use scenario A and timeline End. This demonstrates offline software availability, not physical radio transport. Visit/cache other routes before relying on them offline.
- **Persistence:** pause after a manual advance, wait for **Local snapshot saved**, navigate/reload without a `?scenario=` override. Explicit scenario URLs intentionally create a fresh preset.

A live demo can use Play at a high speed instead of End; the keyboard timeline is the shortest reproducible judge workflow. The screen is an omniscient simulation inspector: it exposes destination state even while the modeled worker lacks a returned ACK. Device status is not an actual disconnected phone receiving remote telemetry.
