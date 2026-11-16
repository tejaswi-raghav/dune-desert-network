# DUNE

**Desert Unified Network for Emergencies**

*No signal. No internet. No one left unheard.*

DUNE is an offline-first, deterministic network simulator for remote field crews and rescue coordinators. It demonstrates small emergency packets traveling through low-power radio links, finite queues and vehicle-assisted store-and-forward contacts. Its signature demo carries an SOS across a complete partition and returns a destination-generated acknowledgement only when a later return path exists.

**This is a browser simulation, not operational radio infrastructure.** It does not transmit LoRa, contact emergency services, guarantee delivery or provide safety certification. Devices are independently modeled software nodes inside one simulation. Phones would need external approved radio hardware for real LoRa. No hardware or desert field test has been completed.

## Verified publication

- **Public GitHub repository:** https://github.com/tejaswi-raghav/dune-desert-network
- **Public Vercel production:** https://dune-desert-network.vercel.app

The project is connected to GitHub; pushes to `main` trigger Vercel production builds. The browser simulator runs locally without a backend. Verification details and limits are recorded in [docs/TEST_REPORT.md](docs/TEST_REPORT.md).

## Run locally

Requirements: Node.js **22.14 or newer** and pnpm. No API keys, paid services or environment secrets are required.

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The locked dependencies are in `pnpm-lock.yaml`. For a reproducible installation after checkout, use `pnpm install --frozen-lockfile`.

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Run browser tests with a server already listening on port 3000. In a separate terminal:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

For an already running alternate host, set `BASE_URL` to its actual URL before `pnpm test:e2e`. `pnpm lint` runs the ESLint check. See [docs/TEST_REPORT.md](docs/TEST_REPORT.md) for checks actually run and their results; commands above do not imply successful execution on every host.

## Judge demonstration

1. Open **Mission control** (`/mission-control`) and choose **A · Simple success** from **Scenario**. The initial check-in originates at `worker` and targets `base`; these nodes maintain separate queues and local state.
2. Click **Play** and inspect the application packet. Watch QUEUED → TRANSMITTING → DELIVERED. The separately created ACK must reach the original source before ACKNOWLEDGED appears. **RECIPIENT RECEIVED** and **E2E ACK RETURNED** are distinct fields.
3. Click **New packet**, select the opposite sender/recipient, choose TEXT, write a short reply and click **Queue packet**. This produces a second real simulated message rather than a canned success indicator. Payloads are bounded to 176 UTF-8 bytes.
4. Choose **C · Total partition**. Advance playback: the SOS remains DEFERRED/UNDELIVERED. Drag the base into range of the worker on the synthetic map, then continue. Only actual restored contact can deliver it.
5. Choose **D · Data mule rescue** and play. Inspect the holder/route as the truck takes custody of a copy, carries it to the destination cluster, and later carries the return ACK toward the worker. Truck receipt alone must never be presented as rescue-base receipt.
6. Export the snapshot with **Export**, then use **Import** to restore it. A snapshot preserves queues, in-flight work, simulated time and RNG state for deterministic continuation.

The UI's speed selector accelerates presentation, not radio data rate. The packet inspector and event feed are the evidence. Map flashes indicate actual attempted transmissions and do not imply successful reception. Map units and coverage are synthetic, not kilometers or surveyed UAE infrastructure. A three-minute pitch script is in [pitch/THREE_MINUTE_PITCH.md](pitch/THREE_MINUTE_PITCH.md); the run of show records exact demonstrated actions.

## Five preset missions

| Mission | What it demonstrates |
|---|---|
| A · Simple success | Viable two-node exchange plus separately transmitted destination ACK. |
| B · Weak link | Seeded poor quality causes loss, retries and delayed outcomes; no hardcoded success. |
| C · Total partition | No eligible route; stored message stays undelivered until contact returns or TTL expires. |
| D · Data mule rescue | Truck motion links separated clusters over time, including delayed return ACK. |
| E · Solar relay failure | A nearly depleted relay loses its only path; absent an alternative, the message remains pending. |

Reset/reselect a mission for the same seed. Change node availability, placement, battery or conservation mode to inspect recovery. Failure scenarios can legitimately exhaust retries or TTL; that is a result rather than a UI defect.

## Application areas

- `/` — cinematic desert introduction, deployment stages and explicit technical boundaries.
- `/mission-control` — synthetic tactical map, node inventory, packet inspector, trace feed, metrics, playback, export/import and packet composer.
- `/device` — mobile worker screen with simulated SOS, short messages, selected recipient, manual location, explicit browser geolocation permission, local queue and energy-saving mode. No private position is uploaded by default; exporting a packet includes any location placed in its payload.
- `/resilience` — adjustable network conditions and repeated seeded routing comparisons. Delivery, emergency delivery, latency, queue and energy values derive from engine outcomes.
- `/engineering` — editable preliminary energy, solar, battery and infrastructure cost arithmetic, assumptions and source links.

## Architecture

```text
React / Next.js UI
      ↓ commands             ↑ snapshots and event traces
Pure TypeScript Simulation engine
      ├─ node-local queues, seeded loss, finite airtime, TTL and hops
      ├─ mobility, battery, conservation windows, store/carry/forward
      └─ destination-generated ACK packets requiring a return path
      ↕
Versioned JSON export/import + local IndexedDB snapshot
```

The domain engine is independent of React and browser storage. `lib/simulation/` contains types, state machine, seeded randomness and channel scheduling; `lib/scenarios/` contains preset inputs; `lib/metrics/` computes experiments; `lib/energy/` provides formulas; `lib/storage/` handles IndexedDB. `components/` and `app/` render the application; `tests/` validates engine/browser behavior. [Architecture details](docs/ARCHITECTURE.md).

## Offline use and privacy

The versioned service worker caches the application shell/assets after an initial successful online load. Visit the application routes before disconnecting and allow cache installation. First launch requires a reachable host, external research links need internet, and browsers can clear or evict storage. Recheck offline navigation after each release. Cached web assets do not make separate phones exchange radio packets. See the test report for observed offline behavior rather than treating this description as a test result.

Simulation state is local to the browser. IndexedDB saves are best effort; export a snapshot for an explicit backup. Imports are size/schema checked. Mock identities are used. Geolocation requires a user action and browser consent; manual coordinates remain available. No emergency-service credentials or endpoints are included.

## Engineering and regulatory assumptions

The model uses abstract synthetic distance, seeded independent packet loss, a simplified serialized half-duplex collision domain and estimated LoRa airtime. Default SF9/125 kHz/4/5 and duty cycle 10% are educational model settings, **not an approved UAE radio profile**. LINK_ACK receipt indication has no separate charged RF airtime; end-to-end ACK packets do. RSSI/SNR and weather attenuation are uncalibrated diagnostics. This is not LoRaWAN, native Meshtastic firmware, a complete BPv7 implementation or a trained AI router. Flooding is a simplified epidemic-copy baseline with a shared hop budget; comparisons do not establish superiority to deployed protocols.

The engineering worksheet's default 12 users/12 radios at $60 and 2 relays at $180 totals $1,080 or $90/user, excluding phones, vehicles, gateway/backhaul, compliance and labor. Battery and solar factors are editable planning assumptions, not thermal qualification. The separate 20-user BOM example shows how sharing changes the result. [Evidence review](docs/RESEARCH.md), [all assumptions and metric definitions](docs/ASSUMPTIONS.md), [supplier anchors and BOM](docs/HARDWARE_BOM.md).

## Deployment and next hardware test

The supported web target is a browser running the Next.js app, hosted locally or built/deployed to Vercel without a backend or paid keys. Verify production build, routes, static assets and offline behavior for the actual deployment. No ordinary web deployment supplies LoRa radio service.

Advance in four gates: browser/lab packet tests → **authorized 2–4 radio test** → surveyed short-range test with one solar relay → monitored crew pilot with independent emergency fallback. Before any RF test obtain written TDRA confirmation of applicable authorization, exact band, radiated power including antenna, occupied bandwidth, access/duty rules, equipment approval and site constraints. Add a real BLE/serial adapter, authenticated identity/encryption/key management, persistent firmware queues, protected temperature-sensed battery/charger, measured currents and actual airtime. Then test blocked links, return-path ACK failure, reboot/duplicate/TTL/buffer behavior and thermal/dust/mounting exposure. [Deployment plan](docs/DEPLOYMENT_PLAN.md), [risk register](docs/RISK_REGISTER.md).

## Pitch and project evidence

The editable seven-slide deck is [pitch/DUNE_Desert_Emergency_Network.pptx](pitch/DUNE_Desert_Emergency_Network.pptx). Presenter and source notes are embedded. Slide 5 uses actual application screenshots and a QR code for the verified live URL. The one-page abstract is available as PDF and Markdown; pitch and exact UI actions are in `pitch/THREE_MINUTE_PITCH.md` and `pitch/DEMO_RUN_OF_SHOW.md`. Rebuild with `DUNE_LIVE_URL=https://dune-desert-network.vercel.app node scripts/build-pitch.cjs`; screenshots must exist first.

License: MIT. DUNE is an independent hackathon prototype, without a safety warranty, emergency SLA or promise of rescue.
