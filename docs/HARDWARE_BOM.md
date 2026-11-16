# Preliminary hardware and ownership cost

Dated **16 November 2026**. USD. No hardware has been bought, assembled, tested or approved for this project. This is a procurement starting point. Listing prices exclude shipping, tax, import charges and integration; stock and regional variants change.

## Observed supplier anchors

| Item | Observed supplier listing | Scope and caveat |
|---|---:|---|
| RAK WisBlock Meshtastic starter kit | $24.99–60.99 across variants; one selected listing $31.99 | Board/core/antenna kit, not a complete rugged user device. Select only an authorized regional RF variant. |
| RAK4631 core module | $17.99–23.99 | Core only; do not add this again if already included in the kit. |
| RAK12501 GNSS module | $8.90 | Optional location hardware; does not provide satellite messaging. |
| Adafruit/Voltaic P105 nominal 5 W ETFE panel | $34.95 | Panel only; charge controller, connector/weatherproofing and mounting extra. |
| Adafruit 3.7 V 6600 mAh lithium-ion pack | $24.50 (1–9 quantity) | **Supervised bench cost anchor only.** Supplier says no built-in thermistor and never use/charge unattended. Not selected for unattended hot desert relays. |
| Adafruit solar Li-ion charger listed alongside panel | $14.95 | Bench reference; chemistry, temperature sensing and protection compatibility must be engineered. |

Sources retrieved on the date above: [RAK starter kit](https://store.rakwireless.com/products/wisblock-meshtastic-starter-kit), [RAK store module prices](https://store.rakwireless.com/), [panel/charger listing](https://www.adafruit.com/product/5367), [battery listing and safety limitations](https://www.adafruit.com/product/353).

## Planning allowances, not supplier quotations

| Assembly | Preliminary budget | Included assumption |
|---|---:|---|
| Portable crew radio | $60–120 | Core kit, protected battery, compact enclosure, cable/antenna and basic assembly; phone excluded. |
| Solar fixed relay | $180–350 | Radio, appropriately specified battery/BMS, 5–10 W panel, controller, enclosure, glands, mast/antenna and assembly. |
| Vehicle radio retrofit | $80–180 | Radio, protected vehicle DC supply and antenna/mounting; truck/fuel/driver excluded. |
| Rescue base radio | $80–180 | Radio, power supply, enclosure and antenna; computer/staff excluded. |
| Gateway/backhaul | Not priced | Authorized cellular/satellite terminal and service require separate supplier/operator quotations. |

These ranges are engineering allowances, not verified complete-system prices or a claim that the listed bench parts can be safely combined. Approval, thermal qualification and integration can exceed these amounts.

Illustrative 20 active-user pilot: 20 portable radios at $90 + 2 relays at $250 + 1 vehicle retrofit at $130 + 1 base at $130 = **$2,560 capital**, or **$128 per active user**. Add 15% hardware spares ($384) to reach $2,944, or $147.20/user. Existing phones, vehicle, staff, backhaul, surveys, spectrum approval, tools and travel are excluded. These are transparent arithmetic examples, not a quoted DUNE product price.

Recurring planning allowance: 10% of hardware capital/year ($256 in that example) plus separately budgeted site visits, cleaning, battery replacement, training and any backhaul subscription. Do not call the service free because peer radio traffic has no mobile data fee. Recompute cost/user at actual active-user count; shared infrastructure becomes costly for very small crews.

## Sizing worksheet

Use board-level measurements in the next stage:

- `Pavg = Psleep × fsleep + Prx × frx + Ptx × ftx + Paux`, where state fractions sum to 1.
- `Eday = 24 × Pavg` Wh/day.
- `Esolar = panel_W × peak_sun_hours × derating` Wh/day; derating includes explicitly chosen conversion, soiling and temperature effects once each.
- `Eusable = battery_V × battery_Ah × usable_fraction × temperature_factor` Wh.
- `autonomy_days = Eusable / Eday`, excluding solar; `daily_margin = Esolar − Eday`.

Example assumption only: Psleep 0.01 W, Prx 0.08 W, Ptx 0.45 W, fractions 0.49/0.50/0.01, no auxiliary load => Pavg 0.0494 W, Eday 1.1856 Wh. A 5 W panel × 4 equivalent sun-hours × 0.55 net derating produces 11 Wh/day; a hypothetical 24 Wh battery at 0.70 usable and 0.80 temperature factor provides 13.44 Wh, or 11.34 days without sun. This intentionally exposes how optimistic a low auxiliary load can be: GNSS, phone, controller and display loads must be measured and added. It is not an autonomy promise.

A high-temperature capacity multiplier is a sensitivity parameter, **not a safe-charge permission or fitted lifetime curve**. Stop charging outside the selected battery's published limits. Low-power receive schedules reduce contact availability and can increase delivery delay. A destroyed relay cannot harvest enough energy to restore itself; only another viable route or later physical contact can recover connectivity.

## Field construction and maintenance

Shade battery/electronics while keeping the panel exposed; record cell and enclosure temperature. Require temperature sensors, BMS cutoffs, fuse, correct charger chemistry, surge/vehicle transient protection and documented wiring. Verify ingress protection of the assembled unit, UV exposure, dust abrasion, glands, seals, mast stability, strain relief, antenna detuning and connector corrosion. Define panel cleaning, post-storm inspection and logged battery replacement from measured health, not an invented fixed service lifetime. A generic IP box does not qualify the assembled radio for desert operation.
