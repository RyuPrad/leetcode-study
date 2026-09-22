# Windows desktop validation — v0.1.1

Validated on Windows 11 x64 with Node.js 24 and Electron 44.4.3.

| Check | Result |
| --- | --- |
| Content catalog | 252 problems, 250 visualizers, 20 topics, 2 reference guides |
| TypeScript and production build | Passed |
| Store, timer, catalog and asset-protocol tests | 19 passed |
| Visualizer regression sweep | All 250 complete; initial/forward/back/reset/final states verified; no browser errors |
| Automatic playback | All 250 match manual execution, stop at completion, and replay from the original input |
| Playback interactions | 0.5×/1×/2×/4× speed, pause/resume, rapid toggles, speed changes, manual steps, reset, presets and custom inputs passed |
| Repeated replay | Custom inputs produce the same results across repeated runs in all five pages with corrected input preservation |
| Presets and input compatibility | 25 representative visualizers, 127 presets, 22 custom-input parsers |
| Legacy visualizer controls | Playback, memory/object display options, invalid-input feedback and fullscreen verified |
| Desktop integration | Offline content, search, progress, bookmarks, notes, wiki links, editable history, backup export/restore and invalid-backup rejection passed |
| Restart and display scaling | Saved data retained; layouts checked at 100%, 125% and 150% |
| Desktop playback | Actual iframe clicks, view/dialog changes, native blur/minimize, rejected untrusted pause messages, and toolbar scaling passed; suspend/lock handlers exercised with simulated power-monitor events |
| Installed application | All 250 packaged visualizers loaded and stepped with networking disabled and Node/Git absent from PATH |
| Upgrade from v0.1.0 | Both installers exited successfully; profile hash was unchanged by the upgrade; v0.1.1 retained progress, bookmarks and reflections and passed desktop playback checks |

The original visualizer behavior is recorded in `tests/fixtures/visualizer-baseline.json`. Corrections are documented separately in `tests/fixtures/visualizer-corrections.json`. The initial conversion fixed invalid combined DOM class tokens in Find the Town Judge, and formatting a flat intermediate list as nested lists in Merge k Sorted Lists.

Playback testing found that five pages reused mutated input when resetting: Remove Element, Remove Duplicates from Sorted Array, Merge Sorted Array, Reverse String, and Combination Sum II. They now retain the loaded input separately. First-run initial/forward/back states are unchanged; three reset-related fixture changes are documented. Repeated custom-input replay has independent expected-result checks. Saved-data formats and study-time rules are unchanged.

The Windows x64 installer is unsigned. Its SHA-256 is:

```text
B1442F361222CE00DF93A01E823F2634EF30FD6A37BE46D5F836716CA1B506B2
```

Installer: `release/LeetCode-Study-0.1.1-Setup.exe` (112,215,954 bytes). Build outputs and test profiles are ignored by Git. The temporary installation used for verification was removed; its isolated data profile was retained and the profile hash was unchanged after uninstall.

Windows 10 is a packaging target but was not tested on a separate Windows 10 machine. The GitHub Actions workflow is configured; hosted CI has not been run from this local branch.
