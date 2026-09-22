# Windows desktop validation ? v0.2.0

Validated locally on Windows 11 x64 with Node.js 24 and Electron 44.4.3.

| Check | Result |
| --- | --- |
| Library and coding coverage | 252 problems with JavaScript starters, statements, examples, references, and local submission suites; 250 visualizers, 20 topics, 2 reference guides |
| TypeScript and production build | Passed |
| Automated unit tests | 26 passed, including existing store/timer/catalog checks |
| Coding definitions | All 3,775 bundled reference cases execute successfully; incorrect implementations rejected for all 252 problems |
| Additional test coverage | 12 additional checks per problem; at least 10 distinct additional inputs except the three finite-size parentheses/N-Queens problems, which exhaust their allowed sizes |
| Adapters and comparison | Lists, trees, graphs, deep copies, in-place mutations, class operations, codecs, guess/MountainArray APIs, alternative valid answers, multiplicity and floating-point tolerance checked |
| Execution limits | Syntax and runtime locations, infinite loops, memory exhaustion, output/log caps, missing host APIs and fresh-context recovery passed |
| Desktop coding | Offline Monaco editor, Run, Submit, Stop, keyboard Run, custom cases, invalid-input feedback, progress, reset confirmation, submission details and reopening passed |
| Persistence and cancellation | Native export/restore includes source, custom cases and submissions; navigation cancels a job; latest draft survives closing before the disk debounce expires |
| Packaged coding | Full desktop coding suite passed against the installed executable with networking disabled and Node/Git absent from PATH; representative list/tree/graph/design/API problems include 700 and 933 |
| Scaling | Controls fit at 100%, 125%, and 150%; native window screenshots inspected |
| Visualizer regression | All 250 match their original initial/forward/back/reset/final states |
| Playback regression | All 250 match manual execution, finish and replay; speed, pause, inputs and repeated replay checks passed |
| Input compatibility | 25 representative visualizers, 127 presets, 22 custom-input parsers passed |
| Existing desktop workflow | Offline library, isolation, progress, bookmarks, notes, wiki links, session editing, backups, restart and desktop playback passed |
| Upgrade from v0.1.1 | Both installers exited successfully. Installation left the profile hash unchanged. First launch migrated to schema 2, archived the exact original, and retained all 7 existing sessions and progress/bookmark/review records |
| Dependency audit | 0 known vulnerabilities reported by npm audit |

Tests are local practice suites, not the official LeetCode judge or a proof that every possible incorrect solution is rejected. Original visualizer reference snippets were made self-contained for the judge: missing heap helpers, N-Queens board construction, Permutation in String comparison, IPO's project count, Longest Happy String's length variable, and MountainArray access were corrected in the coding definitions. Visualizer algorithms remain their existing reference walkthroughs.

Schema 2 preserves progress and history and adds drafts and immutable submission snapshots. Version 1 backup imports are accepted with empty coding fields. The v0.1.1 validation report is preserved in `desktop-validation-0.1.1.md`.

Installer: `release/LeetCode-Study-0.2.0-Setup.exe` ? **114,680,886 bytes**, unsigned.

SHA-256:

```text
F6147914EE4EA257F63D1CD117E6C9DBB22EB110FA71D9227138D8BB547CFD09
```

Detailed results and screenshots are in ignored `test-results/`, including `coding-packaged.json`, `upgrade-0.1.1-to-0.2.0.json`, and `coding-1.png`, `coding-1.25.png`, `coding-1.5.png`. Test profiles are isolated under `.test-data/`; the user's normal profile was not used.

The temporary test installation was removed after verification. Uninstall returned success and left the isolated profile byte-for-byte unchanged; test profiles and reports were retained.

Windows 10 is a packaging target but was not tested on a separate Windows 10 machine. Hosted CI and code signing have not been run/configured; the Windows workflow now includes coding integration tests.
