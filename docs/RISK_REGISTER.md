# Risk register

Reviewed 16 November 2026. Likelihood/impact are qualitative engineering judgments, not quantified predictions. All mitigations below are requirements for later validation unless already demonstrated by software tests.

| Risk | Impact / likelihood | Mitigation and evidence gate | Residual limitation |
|---|---|---|---|
| User mistakes demo SOS for responder alert | Critical / plausible | Persistent DEMO indicator, explicit synthetic map, no responder endpoint; verify critical screens and pitch wording. | Software remains unsuitable as an emergency fallback. |
| Relay ACK mistaken for delivery | Critical / plausible | Separate relay storage, destination receipt and source-return ACK traces; partition tests. | Real sender can remain uncertain after successful destination receipt. |
| Unlawful frequency, power or antenna configuration | High / unresolved | TDRA written confirmation and equipment approval before any RF test. | Off-the-shelf regional preset is insufficient evidence. |
| Terrain/body shielding destroys link | High / likely in field | Bidirectional surveys with actual mounting heights; alternate elevated relay; manual fallback. | No continuous coverage or range guarantee. |
| Vehicle misses contact or takes unsafe route | High / plausible | Contact uncertainty, TTL/buffer displays, safe operator schedule and fallback. | Store-and-forward can deliver too late for an emergency. |
| Heat damages battery or disables charging | Critical / plausible | Select qualified chemistry/product, sensors/BMS, shade and enclosure thermal tests. | Capacity factor in UI does not establish charge safety. |
| Dust/UV/wind damages installation or soils solar | High / likely over time | Assembled ingress/UV/mount tests, cleaning and post-storm inspection budget. | IP rating alone is not environmental qualification. |
| Congestion, flood amplification or priority abuse | High / plausible | Payload/queue/hop/TTL/retry bounds, measured airtime, admission control and authenticated priority in field design. | Sustained load can still overwhelm the channel. |
| Node loses storage/power mid-carry | High / plausible | Persistent flash queues, write durability/reboot tests, redundancy/spares. | Browser snapshot storage is not rugged flash durability evidence. |
| GPS is absent/inaccurate; manual grid is wrong | High / plausible | Show location provenance/age, manual correction, trained users. | Coordinates are not an independently verified position. |
| Private patient/location data leaks | High / plausible | Synthetic defaults, explicit location consent, access control, encryption and retention rules. | Current browser exports are not a medical-data security system. |
| Spoofing, replay or stolen radio | High / plausible | Identity/provisioning, authenticated encryption, replay windows, revocation and signed firmware. | MVP checksum provides no adversarial protection. |
| Hosted/offline shell unavailable | Medium / plausible | Cache versioning, offline/reload tests, explicit first-load/eviction limits and export. | Hosting outages and browser cache policy remain outside control. |
| Simulation results overgeneralized | High / plausible | Label model variables, equal-seed comparisons, pending denominators and evidence gaps. | No field-calibrated RF/thermal model exists. |
| Emergency integration has no staffed response | Critical / unresolved | Named receiving organization, acknowledgement/dispatch contracts, drills and independent fallback. | Server receipt never guarantees rescue. |
| Hardware budget omits support/compliance | Medium / likely | Separate capital, spares, service, visits, phones and backhaul; obtain local quotes. | Initial allowances are not a product price. |

Go/no-go for field pilot: no unresolved spectrum permission; no unsafe battery charging; no automatic real responder alerts; documented independent safety communications and trained participants. The prototype itself does not certify these gates.
