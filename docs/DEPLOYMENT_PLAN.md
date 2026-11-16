# Staged deployment plan

Planning date: 16 November 2026. DUNE currently proves software state transitions. It does not contact responders, provide native browser LoRa, or replace an existing safety communications plan.

| Stage | Work and prerequisites | Evidence needed before advancing |
|---|---|---|
| 1 · Browser and supervised lab | Run deterministic scenarios, record packet/ACK traces, capacity and expiry tests. Prepare a serial/BLE transport contract and replay captured packets in software. No RF transmission required. | Reproducible engine tests, no false delivery under partition, recovery and returned-ACK demonstration, documented offline-cache limits. |
| 2 · Authorized 2–4 radio bench test | Obtain written spectrum/equipment guidance; buy correct-band boards; implement actual adapter, identity and authentication. Use approved low-power/shielded lab procedure as applicable. Existing safety channel remains available. | Separate source/destination serial logs; actual airtime and receive/transmit/sleep current; controlled packet loss, return ACK failure, duplicate/reboot/TTL/buffer tests. |
| 3 · Short-range controlled field test | Site permission, approved RF profile, trained observers, surveyed route and a single solar relay. Add temperature-sensed power system, shade, protected mounting and dust-tight assembled enclosure. | Measured bidirectional delivery versus antenna height, obstruction, traffic and battery state; thermal logs, overnight energy, cleaning/soiling inspection and failover test. No claimed range extrapolation. |
| 4 · Monitored crew pilot | Named operator and support owner, informed participants, device provisioning/revocation, spare parts, drills, approved fallback radio/satellite/return-to-base procedure. Agree escalation/retention with receiving organization. | Pre-agreed delivery/latency targets and confidence, false-alert handling, battery/thermal incidents, support burden, maintenance costs and user comprehension. Human acknowledgement is distinct from server receipt. |

Proposed stage gates are targets, not completed milestones. A useful lab target is 100/100 known packets matched between logs under a stable short link, with every missing return ACK visible. Field targets must be agreed after survey; the simulator does not justify an emergency SLA.

## Authorization questions

Ask TDRA or an accredited local RF/compliance partner to confirm the governing regulation/version, permissible application and band, ERP/EIRP with antenna gain, occupied bandwidth, duty-cycle or channel access requirements, equipment approval/import and individual/class authorization. The project intentionally selects no legally approved UAE RF profile. [TDRA class authorization](https://tdra.gov.ae/en/Services/class-authorization-short-range-devices). Document the response before transmitting.

## Operational plan

Start with one known crew route and a staffed base. Survey elevated relay sites rather than drawing continuous coverage circles. Schedule vehicle contacts as uncertain opportunities; a missed truck is a delayed packet, not a guaranteed rescue. Keep records of actual contact durations and weather/maintenance effects. Train users to distinguish queued, carried, destination-received, sender-acknowledged and human-accepted states.

Maintain independent emergency fallback and overdue-person procedures throughout the pilot. Review patient/location data access and deletion. No automatic external emergency integration is authorized by the MVP. Eventual integration requires organizational agreements, validated identity, encryption/key management, gateway authentication, audit trails and escalation drills.

## Hosting and release

The web application is a static/browser simulation hosted on Vercel. It can run after an initial successful load and cache installation, subject to browser storage/cache eviction and version behavior. Hosting does not carry real off-grid radio packets. See README for verified publication/deployment URLs and TEST_REPORT for actual validation; this planning document intentionally does not invent them.

Use source-controlled lockfile and reproducible build, public repository without keys/private positions, and versioned offline cache. Recheck full shell navigation after releases. Keep exported synthetic scenarios separately from any future field records.

## Pilot resource estimate

The illustrative 20-user hardware allowance is $2,560 before spares, and excludes phones, staff, vehicles, backhaul, certification and fieldwork; details and source anchors are in [HARDWARE_BOM.md](HARDWARE_BOM.md). Obtain procurement and compliance quotes before funding a pilot. Assign named responsibility for charging, panel cleaning, spares, firmware updates and incident review. No budget estimate implies hardware qualification.
