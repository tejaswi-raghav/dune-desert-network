# DUNE verification report

Verification date: **16 November 2026**. Evidence is from executed tests and observed HTTP/browser results; synthetic network metrics are not hardware benchmarks.

## Engine, build and static checks

- **28 / 28 Vitest engine tests passed**, zero failures. Machine-readable result: [validation/engine-results.json](validation/engine-results.json).
- Strict TypeScript check passed (`pnpm typecheck`).
- ESLint passed (`pnpm lint`), with no remaining warnings/errors.
- Next.js production build passed (`pnpm build`), prerendering `/`, `/mission-control`, `/device`, `/resilience` and `/engineering`.

Engine coverage includes successful A→B communication; destination-generated ACK and return-path correctness; recipient delivery with absent ACK path; seeded weak-link retries; a partition that never falsely delivers; restored contact; vehicle carry/delivery/return ACK; TTL including in-flight expiration; duplicate suppression; priority scheduling and aging under continuing contention; low-power availability/energy; battery depletion; source and receiver overflow; schema/input validation; exact mid-flight JSON replay; trace-derived metrics; reproducible repeated policy experiments; energy formulas and sensitivity; and rejection of same-source/destination packets.

## Browser verification

The production browser suite runs the same scenarios in desktop Chromium and a 390px mobile Chromium profile. It checks landing/mission navigation, five scenario outcomes, pause/keyboard playback, JSON export and import, simulated SOS dialog, actual resilience experiments, engineering controls, layout overflow, paused-state IndexedDB persistence, separately addressed base→worker reply and cached-shell offline exchange.

**18 / 18 live browser checks passed**, zero failures (9 desktop +9 mobile). Machine-readable result: [validation/browser-summary.json](validation/browser-summary.json). Tests are executed against the public HTTPS deployment, not screenshots or stubbed engine outputs.

Observed failures were corrected rather than hidden:

1. Development-mode Next.js indicator obscured the Play button at a small viewport. Disabled the development indicator; production does not include it.
2. Offline indicator was hidden by a narrow-screen CSS rule. Kept connectivity status visible; mobile offline retest passed.
3. Added a startup loading gate so no interactive simulation control appears until URL/IndexedDB initialization finishes. The persistence test was also corrected: its observer must wait for an existing database, rather than accidentally creating an empty database before the app initializes its schema.
4. Switching the composer sender could leave a stale recipient. The composer now changes the recipient when needed, and the engine rejects self-addressed packets. The return-message test uses accessible combobox roles; an exact nested-label selector initially failed to find otherwise visible controls.

## Public deployment and repository

- Repository: https://github.com/tejaswi-raghav/dune-desert-network
- Production: https://dune-desert-network.vercel.app
- GitHub-connected Vercel project: `dune-desert-network`, team `vo1d`, Node24.
- Live HTTPS checks returned **200** for all five routes and `/sw.js`, `/icon.svg`, `/manifest.webmanifest`, `/dune-landscape.svg`.
- The public repository contains actual application source, lockfile, tests, research, screenshots and editable presentation; publication was explicitly approved by the user.

## Offline evidence and limits

The automated test loads Mission Control online, waits for service-worker activation/control, visits the canonical route, disables browser networking, reloads, runs the simple-success mission and confirms ACKNOWLEDGED from actual simulation state. Desktop and mobile are checked separately. This establishes offline software execution, **not radio transport between physical devices**. First load needs network; uncached chunks/routes, external references/fonts, browser storage eviction and version changes remain limits. Visit required routes before the field demonstration. Worker v1 waits for old tabs to close; it does not force an active simulation to reload.

## Presentation and PDF

Seven 16:9 editable slides are generated with PptxGenJS. Application screenshots come from the actual running application. Presenter/source notes are embedded. The deck is rendered and inspected slide by slide; slide5 includes the verified live URL and QR code. Package integrity passed with zero findings; exactly seven slide parts and seven source-bearing speaker-note parts were verified. Stale content-type entries emitted by PptxGenJS4 are normalized during generation without altering slide objects. A one-page abstract PDF is generated with ReportLab, confirmed as one A4 page and visually inspected. The deck is inspected through rendered slides; no native PowerPoint compatibility claim is made.

## Practical limits and unimplemented extensions

This MVP models independent nodes in one browser engine. It has no BroadcastChannel/WebRTC peer transport, native LoRa adapter, field-tested RF path, real solar charging, responder integration, certified SLA or real-time operational infrastructure. Telemetry is a small bounded payload, not a medical-device integration. Terrain is illustrative; RSSI/SNR, reach and weather impact are uncalibrated abstractions. One globally serialized RF collision domain is deliberately simple; the model does not emulate a complete PHY/MAC, hidden terminals, clock drift or separately charged link-ACK RF airtime. The flooding baseline shares a global hop budget and is not a faithful Meshtastic comparison. Lab controls do not establish a universal routing advantage. Browser playback rebuilds a preset; only exported/imported state preserves edited placement/configuration.

Power and BOM values are planning inputs, not supplier-verified complete-node measurements. Real operation needs authorized equipment/spectrum, authenticated/encrypted firmware and provisioning, measured airtime/energy, safe thermal charging and enclosure testing, trained users, support, an agreed receiving organization and an independent emergency fallback.
