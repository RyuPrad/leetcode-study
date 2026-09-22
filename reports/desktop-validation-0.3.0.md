# Windows desktop validation - v0.3.0

Validated September 22, 2026, on Windows 11 x64 with Node.js 24 and Electron 44.4.3. This release adds teaching tools to all 250 reference visualizers and live JavaScript debugging for all 252 coding problems.

| Check | Result |
| --- | --- |
| TypeScript and production build | Passed; Windows x64 NSIS installer generated |
| Unit tests | 43 passed, including 17 debugger tests |
| Debugger execution parity | All 3,775 bundled cases across 252 problems matched the normal runner |
| Debugger semantics | Closures, lexical scope/this, shadowing/TDZ, short-circuiting, destructuring, receiver/evaluation order, classes/private fields/super, exceptions and finally checked |
| Suspension and stepping | Real VM suspension, Pause, Into/Over/Out, source breakpoints and repeated loop-header breakpoints passed |
| Safe inspection and limits | Aliases/cycles, Map keys/reads, getter/toJSON avoidance, bounded snapshots/history, memory exhaustion, active execution timeout excluding paused time, instrumentation limits and unsupported-language diagnostics checked |
| Teaching adapters | All 250 passed metadata, diagram entities, backward/forward seeking, state restoration, completion and layout checks |
| Original visualizer behavior | All 250 passed initial/forward/back/reset/final comparisons, with reviewed rendering corrections |
| Playback | All 250 matched manual execution, completion and replay; speed, pause and repeated custom-input replay passed |
| Inputs | 25 representative visualizers, 127 presets and 22 custom-input parsers passed |
| Packaged debugger | Offline breakpoints, stepping, read-only source, history, Play/speed/Pause, case switching, custom cases, Stop/Restart, errors and navigation cleanup passed |
| Packaged coding | Offline Run/Submit/Stop, errors/timeouts, custom cases, keyboard Run, submission reopening, native backup/restore, navigation cancellation and immediate-close draft persistence passed |
| Diagram families | Arrays, optional heap edges, matrices, graph neighbor edges, tree problem 700 and class/design problem 933 checked in the packaged app |
| Existing desktop workflow | Offline library, isolated visualizers, progress/bookmarks, notes/reference links, history editing, backups and restart persistence passed |
| Lifecycle | Tab/dialog changes, focus, minimize and power-event pauses covered by desktop/debugger suites; debugger blur listener also tested with a deterministic native event |
| Scaling and motion | Native screenshots inspected at 100%, 125% and 150%; controls fit, focus views and reduced-motion rendering checked |
| Data compatibility | v0.2.0 isolated profile unchanged byte-for-byte on first v0.3.0 launch; progress, bookmarks, review flags, sessions/reflections, drafts, custom cases and submissions retained |
| Packaged offline content | All 250 lessons loaded and stepped from the final installer payload with networking disabled and Node/Git absent from PATH |
| Dependency audit | 0 known vulnerabilities reported by npm audit |

The 205 precomputed lessons expose their full timeline. The 45 stateful lessons grow their timeline as they run, allowing inspection of visited states without speculative execution. Inorder, preorder and postorder trace displays were corrected to avoid duplicate visits; independent traversal assertions cover those changes.

The debugger uses a dedicated QuickJS Asyncify worker, with 64 MiB VM memory and 10 seconds of active execution. Waiting at checkpoints and Play delays do not consume that execution budget. History is limited to 5,000 frames or 32 MiB, with per-snapshot limits and explicit truncation. Browsing history does not rewind the VM. Continue samples intermediate history; Play records every checkpoint. Completed execution retains the last function values. Debug never submits or completes a problem.

Synchronous algorithm JavaScript is supported. Async/generator code, Promises, eval, dynamic Function construction, Proxy and with are unsupported. Inspection reads own string-keyed data properties without invoking getters; private fields and internal slots are not displayed. Heap view is an optional array interpretation, and read/change arrows show checkpoint activity rather than proven data dependencies. The bundled practice suites are not the official LeetCode judge.

## Release artifact

- Installer: `release/LeetCode-Study-0.3.0-Setup.exe`
- Size: **115,156,644 bytes**
- Signature: **unsigned**
- Installer SHA-256: `2CA670A477881F1BD1FE4AB045D4962AA181C1A471390FF822863D1CBA80C83C`
- Packaged `resources/app.asar` SHA-256: `77D66A5FD4ED04670354EF4BB048ABF9FD583EB187E1506D9B8E151C7F549C28`

The executable used for final package tests was extracted from this installer. Its `app.asar` hash matched `release/win-unpacked/resources/app.asar` exactly. The existing v0.2.0 binary created an isolated profile, which was then opened by the final v0.3.0 payload. The NSIS installation/upgrade UI was not executed for v0.3.0; the user's existing installation and normal profile were left untouched. These checks verify the packaged app and data compatibility, not the installer UI itself.

Detailed results and screenshots are in ignored `test-results/`, including `debug-parity-full.json`, `lessons.json`, `visualizers.json`, `playback.json`, `inputs.json`, `desktop.json`, `debugger-packaged.json`, `coding-packaged.json`, `upgrade-0.2.0-to-0.3.0.json`, representative `lesson-*.png`, and `debugger-1.png`, `debugger-1.25.png`, `debugger-1.5.png`. Test profiles are isolated under `.test-data/`. Prior reports remain in `desktop-validation-0.2.0.md` and `desktop-validation-0.1.1.md`.

Windows 10 is a packaging target but was not tested on a separate Windows 10 machine. Hosted CI and code signing have not been run/configured. The Windows workflow includes lesson and debugger suites.
