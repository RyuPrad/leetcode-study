# Windows desktop validation - v0.5.3

Validated September 24, 2026, on Windows 11 x64 with Node.js 24 and Electron 44.4.3. History-based visualizers now highlight the source line authored for the operation phase, so a displayed array write points to the array assignment. Remove Duplicates highlights `nums[left] = nums[right];` on line 7 for a write; a duplicate comparison highlights line 5 and leaves the skipped write unhighlighted.

| Check | Result |
| --- | --- |
| Operation walkthroughs | Passed for all 250 lessons and 9,537 transitions; zero failures |
| Remove Duplicates regression | Passed for `[1,2,2]`: write highlights line 7 as a copy; duplicate comparison highlights line 5 and not line 7 |
| Reference visualizer parity | Passed for all 250 visualizers |
| Lesson content | Passed all 250 lesson checks |
| Final packaged Electron | Offline regression passed the focused code-line checks, playback controls, zoom layout, restart, and upgrade from the exact v0.5.2 app payload |
| Profile upgrade | All schema-3 progress, sessions, drafts, submissions, and guided records survived; no data-schema change |
| Installer archive | Extracted `resources/app.asar` matches the packaged build SHA-256 exactly |

The authoring script classifies computed array assignments as value writes rather than object-pointer updates. The operations view uses the authored phase-to-line mapping for history-based visualizers; precomputed operations retain their existing line selection. The v0.5.2 editor and focus behavior is documented in [the previous report](desktop-validation-0.5.2.md). Earlier full debugger-parity coverage remains in [the v0.5.0 report](desktop-validation-0.5.0.md).

## Release artifact

- Installer: `release/LeetCode-Study-0.5.3-Setup.exe`
- Size: **115,908,894 bytes**
- Signature: **unsigned**
- Installer SHA-256: `C985B7FBAB79092A4A6C2BBFD641BABCAB573E8F84B18BCFDCBFC9F8BE8011D4`
- Packaged `resources/app.asar` SHA-256: `A3E3820FC0890757083421CEADFA3B50DA329F9761FC9010C7E0D6A70025BD23`

The NSIS installation/upgrade UI was not executed. The final packaged app was exercised offline from the extracted installer payload with an isolated data directory, leaving the normal installation and personal profile untouched. Code signing and automatic updates are not configured. Windows 10 remains a packaging target and was not tested on a separate machine.
