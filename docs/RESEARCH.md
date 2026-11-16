# DUNE evidence review

Research date: **16 November 2026**. Sources below were retrieved with web research that day. These are design inputs, not DUNE field measurements. Supplier prices are observed listings in USD, not quotations or UAE landed costs. The implementation is an educational network simulator, not a radio service or certified emergency system.

## 1. Radio physics and protocol choice

LoRa is a modulation/physical-layer technology. Semtech's SX1262 product page advertises up to +22 dBm transmit power, sensitivity down to −148 dBm and 170 dB maximum link budget; these are configuration-dependent silicon capabilities, not simultaneous guarantees for every modem setting or legal transmit-power limits. A slow spreading factor improves sensitivity at the expense of airtime and capacity. The **whole board**, GNSS, display, regulators and Bluetooth consume more energy than a transceiver specification alone. [Semtech SX1262 and linked datasheet, revision listed 7 April 2025](https://www.semtech.com/products/wireless-rf/lora-connect/sx1262).

Engineering inference: range depends on antenna gain, feedline losses, body shielding, antenna height, terrain obstruction, Fresnel clearance and interference. A dune ridge can break a low mounted link even where a raised relay works. Therefore DUNE promises no kilometer range. Its map is synthetic; displayed coverage is modeled, never measured. A real survey must log bidirectional packet success at chosen mounting heights and modem settings.

LoRaWAN normally connects end devices through gateways to network/application servers; standard LoRaWAN is not synonymous with an autonomous peer mesh. DUNE models a proprietary peer-to-peer forwarding policy over a future LoRa adapter. It does not implement LoRaWAN MAC, certification, or a LoRaWAN network server. [LoRa Alliance architecture](https://lora-alliance.org/about-lorawan/), [LoRaWAN specification topology](https://lora-alliance.org/wp-content/uploads/2020/11/2015_-_lorawan_specification_1r0_611_1.pdf).

## 2. Existing mesh capability and the defensible difference

Meshtastic already provides off-grid text/position exchange and mesh relaying; claiming DUNE invented LoRa mesh would be false. Current routing documentation distinguishes broadcasts from direct messages and describes modem compatibility, packet headers and payload overhead. Packet-ID deduplication and bounded relaying are established practices, not novel AI. DUNE's difference is a judge-visible, traceable emergency workflow and controlled experiments around intermittent vehicle contacts. It is not a proven improvement over Meshtastic firmware. [Meshtastic overview source](https://github.com/meshtastic/meshtastic/blob/master/docs/about/overview/index.mdx), [mesh algorithm](https://meshtastic.org/docs/overview/mesh-algo/).

Meshtastic's Store & Forward module is a history server: clients ask for text history after absence. Servers should remain online, require suitable hardware/PSRAM, may return duplicates and can burden the channel. This differs from a general vehicle physically carrying arbitrary queued application packets across a partition. DUNE must not describe its prototype as wire-compatible with this module. [Official module settings and requirements](https://meshtastic.org/docs/configuration/module/store-and-forward-module/).

## 3. Delay tolerance and acknowledgement

Bundle Protocol v7 defines bundle lifetimes, expiration, hop limits, forwarding, local delivery and status reporting. Its change appendix moves custody transfer out of the BPv7 core to bundle-in-bundle encapsulation. DUNE borrows DTN principles; it is **not an RFC 9171 implementation**. A relay accepting storage is not destination delivery, and destination receipt is not proof that an acknowledgement has returned to the sender. Acknowledgements themselves require a viable contact path and may expire or be lost. A successful software checksum is not authentication. [RFC 9171 §§4–6 and Appendix A](https://www.rfc-editor.org/rfc/rfc9171.html).

## 4. UAE spectrum: unresolved until written confirmation

The TDRA class-authorization service describes authorization and links UWB/SRD regulations. The service's English link resolves to v4, while an official indexed **v5 dated 30 October 2023** is available in Arabic. The National Frequency Plan is version 4 (2024). This version mismatch is an explicit research caveat: the project's simulator setting is not a legal radio profile. [TDRA service](https://tdra.gov.ae/en/Services/class-authorization-short-range-devices), [English v4](https://tdra.gov.ae/-/media/About/regulations-and-ruling/EN/UWB-and-SRD-Regs-V4-0-pdf.ashx), [official v5](https://tdra.gov.ae/-/media/About/regulations-and-ruling/AR/Res-35-of-2023--UWB-and-SDR-5.ashx), [National Frequency Plan](https://tdra.gov.ae/-/media/About/regulations-and-ruling/National-Frequency-Plan---new/National-Frequency-Plan---EN.ashx?t=UAE+National+Frequency+Plan+2024).

The v5 table has band/application-specific radiated-power and channel-access requirements; it does not authorize arbitrary high-power mesh on any frequency a module supports. Before RF tests obtain written confirmation of applicable class/individual authorization, exact band, occupied bandwidth, ERP/EIRP including antenna gain, duty cycle or approved listen-before-talk requirements, equipment type approval, import and site restrictions. Do not assume US915 or EU868 presets are lawful merely because commercial hardware offers them. Regulatory PDF text was inspected; automated screenshot retrieval timed out, so no legal profile was selected from OCR alone.

## 5. Energy, heat and dust

Preliminary solar sizing must separate average load, usable battery energy, sun-hours, conversion losses, soiling and temperature. PVWatts explicitly models temperature separately from general system losses; do not apply its general default loss percentage as a validated desert small-system derate. DUNE's controllable derating is an assumption/sensitivity analysis. [NREL/NLR PVWatts loss guidance](https://pvwatts.nlr.gov/docs/help_system_sysloss.php), [PVWatts design model](https://sam.nlr.gov/photovoltaic/).

Battery chemistry and product limits must govern charging and discharge. For example, Victron's cited Lithium Smart product permits charge only at +5 to +50 °C and discharge at −20 to +50 °C; these limits apply to that product, not all batteries. Temperature sensing, BMS cutoff, shaded mounting and recorded enclosure temperatures are prerequisites; warm ambient air does not bound sun-heated enclosure temperature. [Manufacturer operation limits](https://www.victronenergy.com/media/pg/Lithium_Battery_Smart/en/operation.html).

Ingress ratings describe specified dust/water tests, not universal UV, sand abrasion, vibration or heat survival. Design toward a tested dust-tight enclosure with sealed cable glands, strain relief, UV resistant exterior, protected antenna connector and maintainable seals. Verify the assembled unit after modifications. IEC's overview returned HTTP 403 during research; an accredited testing provider explains the relevant IEC 60529 categories. [Intertek ingress testing](https://www.intertek.com/lighting/performance/ingress-protection/). DUNE claims no IP or environmental certification.

Sandstorm attenuation is a hypothetical knob in this simulator; no measured desert RF attenuation curve was established. Operational consequences such as dirty solar panels, displaced mounts, poor visibility and delayed maintenance deserve separate tests instead of attributing all failure to radio absorption.

## 6. Alternatives and adjacent services

| Alternative | Established capability | DUNE implication |
|---|---|---|
| Meshtastic | Inexpensive off-grid LoRa messaging and community firmware | Benchmark and possible prototype adapter; do not claim novelty for mesh itself. |
| goTenna Pro X2 | Dedicated tactical mesh radio, smartphone/ATAK integration and relay operation | Mature adjacent solution; manufacturer aerial-relay range claims are not comparable to ground desert coverage. No verified price quote used. |
| Garmin inReach | Dedicated satellite communication and coordinated SOS, with device/plan conditions | Wider backhaul option and safety fallback, not a DUNE capability. Current support says selected devices retain SOS during suspension; verify actual device and plan, rather than assuming every SOS needs a current monthly subscription. |
| ITU/ETC disaster networks | Institutional emergency communications planning and connectivity assessment | Integration requires organizational agreements and interoperable procedures. |

Sources: [goTenna product](https://gotennapro.com/products/gotenna-pro-x2), [Garmin suspension conditions](https://support.garmin.com/en-GB/?faq=Y3m0PPdXk22IhFGJr9CMQ7), [ITU/ETC connectivity map](https://www.itu.int/en/ITU-D/Emergency-Telecommunications/Pages/Disaster-Connectivity-Map.aspx).

## 7. Costs and emergency integration

Observed component prices and estimated assembly budgets appear in [HARDWARE_BOM.md](HARDWARE_BOM.md). A board price is not cost per safely equipped user. Include batteries, enclosure, integration, spares, maintenance, spectrum compliance and backhaul separately.

DUNE sends nothing to real emergency services. A future gateway needs an agreed receiving organization, staffed escalation process, message schema, identity/authentication, receipt and human acceptance semantics, fallback channels, drills, privacy policy and retention limits. Receipt by a server cannot imply dispatch or rescue. ITU planning guidance emphasizes coordination, priority and redundant emergency connectivity. [ITU national emergency telecommunications planning guidelines](https://www.itu.int/en/ITU-D/Emergency-Telecommunications/Documents/2024/Guideline%20on%20National%20Emergency%20Telecommunication%20Plans.pdf).

## Evidence gaps and disagreements

- Marketing maxima for radio range/sensitivity and long battery life are not a desert system performance guarantee.
- TDRA English/Arabic document versions differ; regulator confirmation is required.
- No measured hardware airtime, current draw, thermal curve, solar generation, operational range or rescue outcome exists for DUNE.
- Synthetic seeded experiments can compare implemented policies only. They cannot establish superiority over real deployed competitors, nor clinical or emergency effectiveness.
