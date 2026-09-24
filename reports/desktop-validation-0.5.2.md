# Windows desktop validation - v0.5.2

Validated September 22, 2026, on Windows 11 x64 with Node.js 24 and Electron 44.4.3. Returning to Code restores the solution's cursor, selections and scroll position and focuses the editor for immediate typing. First opening and Debug's Stop / edit action also focus the solution. View state lasts for the current problem visit; it is not saved across closing the problem or app.

| Check | Result |
| --- | --- |
| TypeScript and production build | Passed; Windows x64 NSIS installer generated |
| Unit tests | 56 passed, including all 252 coding definitions and 3,775 reference cases |
| View restoration | Actual Monaco browser checks passed caret, reversed selection, multiple cursors, scroll with an offscreen caret, interrupted tab returns, undo and TabOut |
| Focus requests | Passed first deferred mount, rapid tab switches, cancellation before and after mount, competing search focus, keyboard input, window blur, dialogs and background renders |
| Source lifecycle | Passed replacement source and new problem/model checks; stale view state is discarded |
| Desktop tab returns | Development and final packaged Electron passed Learn, Visualizer, Notes and History to Code, plus keyboard tab activation; tests type at the prior caret or selection without refocusing the editor |
| Debug focus | Solution stays unfocused behind Debug; Stop / edit and Back to code restore solution focus, with typing verified at the saved cursor |
| Coding regression | Development and final packaged Electron passed offline Run/Submit/Stop, error-line focus, timeouts, custom cases, submission reopening, backups and immediate-close draft persistence |
| Debugger regression | Development and final packaged Electron passed breakpoints, stepping, Play/Pause/speed, read-only source, history, custom cases, errors, restart and cleanup |
| TabOut regression | Browser and Electron checks passed boundaries, native fallback, suggestions/snippets, undo, preference persistence and disabled/read-only modes |
| Layout | Coding and debugger controls fit at 100%, 125% and 150% zoom; native packaged coding capture inspected |
| v0.5.1 profile upgrade | Exact former installer payload seeded an isolated schema-3 profile; v0.5.2 preserved record collections, guided answers/hints/position, walkthrough preference and paused reopening |
| Installer payload | Extracted app archive matches the packaged build exactly; application exercised offline with Node/Git absent from PATH |

The editor model stays mounted across tab switches, preserving source and undo history. A cancellable focus request starts at an explicit Code activation or Stop / edit action. It is consumed after the visible editor's layout and view restoration; later interactions cancel it, and normal saves or renders do not request focus. Dialogs and Debug prevent focusing the covered solution. There are no desktop API or study-data schema changes.

The previous TabOut release is documented in [the v0.5.1 report](desktop-validation-0.5.1.md). The 250-lesson, 750-prediction, 9,537-transition and full 3,775-case debugger-parity validations remain in [the v0.5.0 report](desktop-validation-0.5.0.md); those full traversals were not repeated for this editor change.

## Release artifact

- Installer: `release/LeetCode-Study-0.5.2-Setup.exe`
- Size: **115,908,628 bytes**
- Signature: **unsigned**
- Installer SHA-256: `CA83152D9525D4D019F154AE79C023CE5A641CB97D0FAE1A6AC94B57929AB90D`
- Packaged `resources/app.asar` SHA-256: `B5A12DD38B787AA4535AB0382D4F8C0ECA2467FAE59D696B01B331AEAF650675`

The NSIS installation/upgrade UI was not executed. Tests launched the extracted payload with isolated data directories, leaving the user's installed app and personal profile untouched. The installer retains its desktop-shortcut restoration and launch-after-install settings. Code signing and automatic updates are not configured. Windows 10 remains a packaging target and was not tested on a separate machine.

Local ignored evidence under `test-results/` includes `release-0.5.2.json`, `editor-focus.json`, `tabout.json`, development/packaged coding and debugger reports, and `operations-packaged.json`. The release manifest records installer/archive hashes and report timestamps. Test sources are checked in, and CI's existing `npm run test:editor` step now includes view/focus restoration checks. Hosted CI status is separate from these local checks.
