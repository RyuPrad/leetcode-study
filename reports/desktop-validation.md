# Windows desktop validation - v0.5.4

Validated September 24, 2026, on Windows 11 x64 with Node.js 24 and Electron 44.4.3. History-based code highlighting now uses the current execution location when an authored phase name occurs on multiple source lines. The audit covered all 45 history visualizers and 1,137 recorded states. It found 13 reused phase labels whose single-line mapping caused 37 stale highlights across 11 problems: 11, 15, 35, 74, 92, 167, 374, 410, 704, 875, and 1011. Remove Duplicates now highlights both `left++` and `nums[left] = nums[right];` for its combined write.

| Check | Result |
| --- | --- |
| Operation walkthroughs | Passed all 250 lessons and 9,537 transitions; zero failures; exact source-line highlights checked |
| Phase-to-line audit | All recorded states resolve to their current trace line or an explicit authored mapping; all 13 ambiguous phase mappings now defer to the live trace location |
| Remove Duplicates regression | Passed for `[1,2,2]`: write highlights lines 6 and 7 together; duplicate comparison highlights line 5 only |
| Reference visualizer parity | Passed for all 250 visualizers |
| Lesson content | Passed all 250 lesson checks |
| Final packaged Electron | Offline run passed exact highlighting for Remove Duplicates and the 11 affected problems, plus playback, zoom, and restart checks |
| Profile upgrade | Exact v0.5.3 app payload preserved all schema-3 progress, sessions, drafts, submissions, and guided records; study-data schema is unchanged |
| Windows build | TypeScript and production build passed; x64 NSIS installer generated |

For phases that occur on only one source line, the authored phase mapping remains in use. For reused phase names, the visualizer uses the active trace location so separate branches and statements do not all point to the same line. The Remove Duplicates write is explicitly authored as a combined two-line operation. Earlier release behavior is documented in [the v0.5.3 report](desktop-validation-0.5.3.md); the v0.5.2 editor and focus behavior remains in [the v0.5.2 report](desktop-validation-0.5.2.md).

## Release artifact

- Installer: `release/LeetCode-Study-0.5.4-Setup.exe`
- Size: **115,908,343 bytes**
- Signature: **unsigned**
- Installer SHA-256: `B27A326A87814B20119A672E02C21EABC3FA81B2287A658E405DD62938AF00BB`
- Packaged `resources/app.asar` SHA-256: `F93CE1DFF19C3465DEFC9C37C833036DEF6202C2A308AE4C1842CF660C8FA927`

The NSIS installation UI was not executed. The final packaged app was exercised offline from `release/win-unpacked` with isolated data directories; the normal installation and personal profile were untouched. The installer payload was not separately extracted for an archive-parity check. Code signing and automatic updates are not configured. Windows 10 remains a packaging target and was not tested on a separate machine.
