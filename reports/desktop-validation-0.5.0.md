# Windows desktop validation - v0.5.0

Validated September 22, 2026, on Windows 11 x64 with Node.js 24 and Electron 44.4.3. This release adds Detailed/Compact walkthroughs to all 250 reference lessons and own-code Debug. Detailed playback presents Focus, Action and Result with a two-second dwell per moment at 1x. Reads and lookups stay in place; operation labels distinguish checks, calculations, stores, removals and reference changes. Transfer arrows require an explicit relationship.

| Check | Result |
| --- | --- |
| TypeScript, content checks and production build | Passed; Windows x64 NSIS package generated |
| Unit tests | 51 passed, including debugger semantics, native collection observations, overridden methods, presentation acknowledgements, cancellation and timeout accounting |
| Reference operations | All 250 lessons and 9,537 default-example transitions passed completion, operation descriptions, source locations and visible source highlighting |
| Two Sum operation semantics | Lookup miss/hit reports actual outcomes without a transfer arrow; insertion retains its labeled arrow; map entries identify numbers and original indices; a pending lookup does not reveal its result |
| Moment review | Previous/Next moment does not execute an instruction twice; whole-step seeking restores live diagram identities after reviewing a moment |
| Detailed playback | Two-second dwell at 1x, all four speeds, pause/resume, Compact pacing and local preference persistence passed |
| Guided content and execution | All 250 lessons and 750 predictions passed actual before/after assertions, source references, diagram targets, answers, feedback, both hints, reveals and completion |
| Guided controls | Prediction barriers, backward review, restart, timeline completion, recovery, lesson revisions and keyboard resizing passed |
| Reference teaching adapters | All 250 passed metadata, entities, seeking, restored states, completion and layout checks |
| Original visualizer behavior | All 250 passed initial/forward/back/reset/final comparisons against original fixtures and reviewed corrections; Two Sum corrections reflect clearer map labels and removal of a premature lookup result |
| Compact playback | All 250 matched manual execution, completion and replay; speed, pause and input lifecycle checks passed |
| Inputs | 25 representative visualizers, 127 presets and 22 custom-input parsers passed |
| Debugger execution parity | All 3,775 bundled cases across 252 problems matched the normal runner |
| Debugger regression | Development and final packaged suites passed suspension, breakpoints, stepping, Play/Pause/speed, read-only source, bounded history, custom cases, errors, Stop/Restart and cleanup |
| Coding regression | Development and final packaged suites passed offline Run/Submit/Stop, errors/timeouts, custom cases, keyboard Run, submission reopening, backups, navigation cancellation and immediate-close draft persistence |
| Guided desktop integration | Development and final packaged suites passed offline questions, keyboard answers, both engine types, backups, lifecycle pauses, search/activity forwarding and restart persistence |
| Display scaling | 100%, 125% and 150% layouts checked; code and moment controls remain accessible in independently scrollable panes; no document-level horizontal overflow |
| Shared display preference | Detailed/Compact preference propagates between views and survives restart; reopening starts paused |
| Existing desktop workflow | Offline library, isolated visualizers, progress/bookmarks/review flags, notes/reference links, history editing, backup validation and restart persistence passed |
| v0.4.0 data upgrade | Exact former installer payload created an isolated profile; development and final packaged v0.5.0 retained its schema-3 records, including drafts, custom cases, guided answers, hints and position |
| Dependency audit | 0 known vulnerabilities reported by npm audit |

The full reference-operation, prediction and visualizer traversals run in Chromium against source files. The 750-prediction functional suite and legacy playback suite explicitly use Compact mode; the separate timing suite checks Detailed mode, and Electron guided tests exercise its default behavior. Packaged Electron suites cover representative lessons and coding/debugging workflows rather than all 750 predictions. Problems 700 and 933 have Notes and Code without reference visualizers.

Reference operation descriptions are compiled from actual reference JavaScript with per-line rules and current state values. Two Sum has explicit lookup and insertion descriptions and targets. Other lessons retain their existing diagrams, with neutral descriptions when a more specific relationship is unavailable. Arbitrary read/change combinations no longer generate arrows. Tree, graph and list connections remain structural links. Debug observations record native collection outcomes and bounded state changes after execution; they do not claim unobserved data dependencies. Each observation has its own source location, separate from the debugger's next-statement indicator.

Algorithm steps commit once. Reviewing a presentation moment does not undo or rerun the algorithm. Guided predictions remain barriers before the corresponding transition. Debug Play waits for a matching presentation acknowledgement, ignores stale acknowledgements and excludes presentation waits from the active VM timeout. Continue and Step controls retain their execution semantics.

## Data compatibility and release artifact

Study-data schema remains version 3. The upgrade test runs the exact v0.4.0 application payload against a fresh isolated profile, closes it, then opens that profile with v0.5.0. It compares all saved record collections before interacting, verifies a saved guided answer and hint state at the original position, changes the shared walkthrough preference, pauses playback between moments, and checks restart persistence. Existing migration and backup validation unit tests also pass. The display preference is stored locally and is intentionally separate from study-data backups.

- Installer: `release/LeetCode-Study-0.5.0-Setup.exe`
- Size: **115,907,422 bytes**
- Signature: **unsigned**
- Installer SHA-256: `C6A431987665AD35BD20BAC97873281580473664742240AEDCFDD39D827D3F88`
- Packaged `resources/app.asar` SHA-256: `65C81D741142507ADD59B8CF06196537201F7A63523F96B33BAB7D1F1F699F87`
- Final payload verification: **Passed; the archive extracted from this installer matches the packaged build exactly**

Final packaged coding, debugger, guided-learning and operation/upgrade tests passed with networking disabled and Node/Git absent from PATH. Their executables were extracted from the exact NSIS installer listed above. Native Electron captures document the final layouts.

The installer is configured to recreate the desktop shortcut during a manual reinstall and open the app when installation finishes. The NSIS installation/upgrade UI was not executed for this release. The user's normal installation and profile were left untouched; the tests use isolated profiles under `.test-data/`.

## Limits and evidence

The debugger supports synchronous algorithm JavaScript. Async/generator code, Promises, eval, dynamic Function, Proxy and with receive diagnostics. QuickJS has a 64 MiB VM limit and a 10-second active execution budget excluding paused and presentation waits. History is capped at 5,000 frames or 32 MiB; Continue samples intermediate states and history browsing does not rewind the VM. Inspection avoids getters and toJSON, with bounded snapshots; private fields and internal slots are not displayed. Observations are bounded and may summarize multiple operations at one checkpoint. Bundled practice tests are not the official LeetCode judge.

Detailed results and screenshots are local ignored artifacts under `test-results/`. Principal records are `release-0.5.0.json`, `operations.json`, `operation-playback.json`, `operations-desktop.json`, `operations-packaged.json`, `guided.json`, `guided-controls.json`, `guided-desktop.json`, `guided-packaged.json`, `debug-parity-full.json`, `lessons.json`, `visualizers.json`, `playback.json`, `inputs.json`, `desktop.json`, `coding-e2e.json`, `coding-packaged.json`, `debugger-e2e.json` and `debugger-packaged.json`. The release manifest records artifact and report hashes, timestamps and test counts. Layout captures include `operations-desktop-1.png`, `operations-desktop-1.25.png`, `operations-desktop-1.5.png` and the corresponding guided/debugger captures. Test sources are checked in under `tests/` and `scripts/`. Earlier validation is archived in `desktop-validation-0.4.0.md` and prior versioned reports.

Windows 11 x64 was tested. Windows 10 remains a packaging target and was not tested on a separate machine. Automated accessibility checks cover accessible names, keyboard controls and feedback markup; a manual screen-reader audit was not performed. Hosted CI was updated but not run here. Code signing and automatic updates are not configured.
