# Windows desktop validation - v0.4.0

Validated September 22, 2026, on Windows 11 x64 with Node.js 24 and Electron 44.4.3. This release adds offline guided learning to all 250 reference visualizers: one fixed example and three authored predictions per lesson, with explanations, hints, feedback and saved progress. Coding and live debugging remain available for all 252 problems.

| Check | Result |
| --- | --- |
| TypeScript, content checks and production build | Passed; Windows x64 NSIS package generated |
| Unit tests | 49 passed, including debugger semantics/limits and guided progress/migration validation |
| Guided content and execution | Source Chromium suite: all 250 lessons and 750 checkpoints passed actual before/after assertions, code references, diagram targets, answers, feedback, both hints, reveals and completion |
| Guided navigation | Seeks and adapter calls stop at unresolved predictions; backward review preserves answers; restart retains earlier completion; completing by timeline or Next prediction passed |
| Guided recovery and revisions | Mismatched state reports an error with working Restart; revised content starts a fresh walkthrough and retains prior completion |
| Guided isolation and persistence | Origin/source/session/run checks, stale-message rejection, saved answers/hints/position, paused resume and cleanup passed; guided completion does not submit or solve coding problems |
| Guided desktop integration | Representative development and packaged Electron suites passed offline questions, keyboard answers, both engine types, native backups, lifecycle pauses, search/activity forwarding and restart persistence |
| Display and accessibility controls | 100%, 125% and 150% layouts checked; reference code stays visible; keyboard splitter resizing works at wide and narrow sizes without stepping; reduced-motion checks passed |
| Reference teaching adapters | All 250 passed metadata, diagram entities, backward/forward seeking, restored states, completion and layout checks |
| Original visualizer behavior | All 250 passed initial/forward/back/reset/final comparisons against original fixtures and reviewed corrections |
| Playback | All 250 matched manual execution, completion and replay; speed, pause and input lifecycle checks passed |
| Inputs | 25 representative visualizers, 127 presets and 22 custom-input parsers passed |
| Debugger execution parity | All 3,775 bundled cases across 252 problems matched the normal runner |
| Debugger regression | Development and packaged suites passed suspension, breakpoints, stepping, Play/Pause/speed, read-only source, bounded history, custom cases, errors, Stop/Restart and cleanup |
| Coding regression | Development and packaged suites passed offline Run/Submit/Stop, errors/timeouts, custom cases, keyboard Run, submission reopening, native backups, navigation cancellation and immediate-close draft persistence |
| Existing desktop workflow | Offline library, isolated visualizers, progress/bookmarks/review flags, notes/reference links, history editing, backup validation and restart persistence passed |
| Schema migration | Exact v0.3.0 payload created isolated schema-2 profiles; development and packaged v0.4.0 migrated to schema 3, archived original bytes exactly and retained every study/coding record |
| Backup compatibility | Versions 1 and 2 migrate with empty missing fields; schema-3 guided records round-trip through backups; malformed updates leave saved data unchanged |
| Dependency audit | 0 known vulnerabilities reported by npm audit |

Guided navigation supports the 205 precomputed lessons and 45 stateful lessons. Checkpoints do not advance and undo the visible algorithm to discover answers. The unrestricted Visualizer tab retains presets and custom inputs. Guided mode hides the execution inspector and answer-bearing future trace material while keeping reference code visible. Problems 700 and 933 have Notes and Code, without a guided lesson. The complete 750-checkpoint traversal runs against source visualizers in Chromium; packaged Electron tests exercise representative guided lessons and migration, rather than all 750 checkpoints.

The guided Electron tests exercise pointer and keyboard interactions, saved pending questions, correct answers and Show me, completion review, restart, native backup dialogs with controlled test responses, tab changes, minimization and power-event pauses. The guided blur listener uses a deterministic native blur event; the existing desktop suite covers window-focus behavior. Automated accessibility checks cover accessible names, keyboard controls and feedback markup, not a manual screen-reader compatibility audit.

## Data compatibility and release artifact

The migration test runs the exact former v0.3.0 installer payload against a fresh isolated profile, closes it, then opens that profile with v0.4.0. It verifies schema 3, a byte-for-byte archive of the schema-2 original, and retention of progress, bookmarks, review flags, closed sessions/reflections, draft source, custom cases, submissions and console output. It then answers a checkpoint using an incorrect attempt, two hints and a correct answer, restarts, and verifies the saved position resumes paused. Existing records and the archive remain intact. Unit tests also cover version-1 migration and migration from a recovery backup.

- Installer: `release/LeetCode-Study-0.4.0-Setup.exe`
- Size: **115,775,998 bytes**
- Signature: **unsigned**
- Installer SHA-256: `77D64D1F952E99890239B232600724D740C4271726B1723C888F6345C6375094`
- Packaged `resources/app.asar` SHA-256: `94919075B4949259BCE018956E00FA16CD9AF27E2ECF517284A13C8CE9654813`
- Final rebuilt payload/hash verification: **Passed; extracted archive matches the packaged build exactly**

Packaged coding, debugger, guided-learning and migration tests passed with networking disabled and Node/Git absent from PATH. Executables were extracted from the generated NSIS payload. After the final content and compact-layout corrections, all 750 Chromium checkpoints and focused control checks passed again. The 47 diagram answer targets across 16 lessons passed visibility checks, with incorrect keyboard selections and correct mouse selections covered. Guided-learning and migration suites passed again against the exact final installer payload listed above; its archive hash matches `release/win-unpacked/resources/app.asar`.

The NSIS installation/upgrade UI was not executed for v0.4.0. The user's normal installed app and profile were left untouched. These checks verify the packaged application and migration of isolated data, not the installer UI.

## Limits and evidence

The debugger supports synchronous algorithm JavaScript. Async/generator code, Promises, eval, dynamic Function, Proxy and with receive diagnostics. QuickJS has a 64 MiB VM limit and a 10-second active execution budget excluding paused/Play waits. History is capped at 5,000 frames or 32 MiB; Continue samples intermediate states and browsing does not rewind the VM. Inspection avoids getters and toJSON, with bounded snapshots; private fields and internal slots are not displayed. Heap view interprets arrays, and activity arrows do not prove data dependencies. Bundled practice tests are not the official LeetCode judge.

Detailed results and screenshots are local ignored artifacts under test-results/. Principal records are guided.json, guided-controls.json, guided-desktop.json, guided-packaged.json, guided-upgrade-e2e.json, guided-upgrade-packaged.json, debug-parity-full.json, lessons.json, visualizers.json, playback.json, inputs.json, desktop.json, coding-e2e.json, coding-packaged.json, debugger-e2e.json and debugger-packaged.json. Layout screenshots include guided-desktop-1.png, guided-desktop-1.25.png and guided-desktop-1.5.png. Test profiles live under .test-data/. Corresponding test sources are checked in under tests/ and scripts/. Prior reports remain in desktop-validation-0.3.0.md, desktop-validation-0.2.0.md and desktop-validation-0.1.1.md.

Windows 11 x64 was tested. Windows 10 remains a packaging target and was not tested on a separate machine. Hosted CI, code signing and automatic updates were not exercised or configured for this release.
