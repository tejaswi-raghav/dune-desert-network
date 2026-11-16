# DUNE architecture

## Implemented software boundary

```text
Next.js routes and React controls
       │ user commands / render snapshots
       ▼
Pure TypeScript Simulation engine ───► event trace + computed metrics
       │       │
       │       ├─ seeded RNG, simulated clock, in-flight event completion
       │       ├─ node-local queues, energy, mobility, contact availability
       │       └─ bounded forwarding + independently routed end-to-end ACKs
       ▼
Versioned JSON snapshot ◄────► IndexedDB / file export-import

Versioned service worker ───► offline application assets (browser permitting)
```

`lib/simulation/types.ts` defines packets, nodes, links, configuration, snapshots and metrics. `lib/simulation/index.ts` is independent of React and browser storage. `lib/scenarios/index.ts` builds seeded preset inputs. `lib/metrics/` exposes metrics/experiments derived from state, `lib/energy/` contains editable preliminary energy arithmetic and `lib/storage/` wraps IndexedDB. UI components render state and traces; animations must correspond to actual simulation events.

## State and time

Time is simulated seconds. Coordinates and ranges are abstract synthetic units. A source creates a bounded-size packet, queues it, and a scheduler chooses an eligible transmission under channel, duty-cycle, battery and contact constraints. Seeded loss determines success. In-flight events complete only after airtime; expired/out-of-range or unavailable contacts must not create successful delivery. Queues, RNG state and in-flight work are serialized so exact replay does not restart random sequences.

The scheduler compares emergency priority with aging. The engine supports DUNE, constrained-routing and simplified flooding policies. It exposes the selected route/reason; it makes no machine-learning claim. Global traces let a judge inspect facts that a disconnected physical sender would not yet know.

## Store, carry and acknowledge

A relay or vehicle receiving a payload becomes a holder, subject to finite buffer and lifetime. Vehicle motion changes later contact opportunities. Destination receipt creates an ACK packet with its own forwarding lifecycle. When the truck leaves the destination cluster, the ACK can wait and travel back later; only the ACK reaching the source marks the original message acknowledged. Local link success, relay storage, destination receipt and source confirmation remain distinct. Duplicate detection prevents repeated application delivery; extra forwarded copies can still consume airtime in the flooding baseline.

## Persistence and offline behavior

`saveSnapshot`/`loadSnapshot` use the `dune-simulator-v1` IndexedDB database. Export/import preserves synthetic scenarios and replay state, subject to validation. No cloud database or private position upload is required. Service-worker caching enables the installed shell to work without internet after successful load, but first launch, uncached routes and browser eviction are limits. Version updates should be applied by reloading when safe; research/source links remain external. See TEST_REPORT for checks actually performed.

## Future adapter contract (not implemented hardware)

A hardware adapter would provide radio receive events, send completion/link outcome, monotonic time, battery state and authenticated peer identity to the same application semantics. BLE or serial bridges the phone to an MCU/radio. Replace synthetic link/RNG/mobility with observed contact events; do not run a predictive browser success flag as proof of real reception. Define a compact binary wire format, actual overhead, fragmentation/reassembly or payload rejection, persistent flash queue, replay protection, key provisioning/revocation and tested clock/TTL handling before interoperability claims.

A solar relay needs approved radio/antenna, protected temperature-sensed power, storage and tested enclosure. An optional authorized cellular/satellite gateway is a separate future transport and external-service contract. It is not present because the simulator is hosted on Vercel. No gateway may automatically contact emergency services without an agreed receiving organization and operational safeguards.

## Threat and resource boundaries

The MVP uses mock identities and synthetic data; its integrity checksum is not cryptographic authentication. A field version requires authenticated encryption, identity binding, message replay protection, secure keys, signed updates, device loss/revocation, queue quotas and audit retention. A malicious P0 sender could otherwise monopolize finite airtime. Browser persistence and packet exports should not contain live patient/location data in a public repository. All radio/protocol/legal claims are bounded by [ASSUMPTIONS.md](ASSUMPTIONS.md).
