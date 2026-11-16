# DUNE — Desert Unified Network for Emergencies
**No signal. No internet. No one left unheard.**

Remote field crews need to exchange a small amount of useful information when mobile coverage is absent: distress, location, check-ins and medical observations. DUNE explores a low-power peer-to-peer LoRa network with solar relays and vehicle-assisted store-and-forward. Its central idea is to treat intermittent contact as a resource, with clear evidence of what has—and has not—been delivered.

## Working prototype
A deterministic, browser-local simulator gives each modeled device an identity, queue, battery and contact state. Packets have a TTL, hop limit, size, priority, sequence and checksum. A shared-channel scheduler uses estimated LoRa airtime, seeded loss, duty-cycle throttling and priority aging. A destination-generated acknowledgement is an independent packet: a relay or vehicle accepting a message never proves that the recipient received it. A failed return path leaves the sender without end-to-end confirmation.

Five seeded scenarios demonstrate direct success, weak-link retries, complete partition, vehicle data-mule rescue, and depleted solar-relay failure. Mission Control exposes the packet trace, link assumptions, queue status and computed metrics. Field Device provides a mobile queue and message workflow. Resilience Lab compares routing policies using actual synthetic runs. Engineering exposes power, solar, battery and shared-infrastructure cost assumptions. The cached application can run offline after a successful load and cache preparation.

## Distinction and scope
Meshtastic and other off-grid systems already provide valuable radio mesh messaging. DUNE's hackathon contribution is an inspectable delayed-contact rescue workflow, a transparent priority policy, and reproducible comparisons that expose failure as clearly as success. The implementation is a custom simulator; it is not Meshtastic firmware or an interoperable DTN Bundle Protocol stack.

**The website does not carry LoRa packets, contact responders, or provide certified emergency communication.** Map coordinates and radio performance are synthetic. A cached PWA is software availability, not an internet-free transport between independent physical radios. There is no real hardware adapter or completed field test.

## Feasible next steps
1. Reproduce the browser scenarios and define a hardware transport adapter contract.
2. Obtain regional authorization and test 2–4 actual LoRa radios on the bench, measuring payload delivery, airtime, retry cost and returned acknowledgements.
3. Add one instrumented solar relay; test line of sight, antenna placement, dust/UV protection, temperature, battery cutoffs and energy balance.
4. Run a monitored pilot with trained crew, a support owner, provisioning/security controls, consent for location, and an independent emergency fallback.

Pilot success should be measured by delivery rate per priority, delay distribution, ACK return rate, queue expiry, measured energy/day and cost per active user. No universal range, delivery guarantee or emergency SLA is claimed. See `docs/RESEARCH.md`, `docs/HARDWARE_BOM.md` and `docs/RISK_REGISTER.md` for dated evidence and unresolved questions.
