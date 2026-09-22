# Windows desktop validation - v0.5.1

Validated September 22, 2026, on Windows 11 x64 with Node.js 24 and Electron 44.4.3. This release adds TabOut navigation to the editable JavaScript solution editor. Tab moves past the next closing bracket or quote on the same line; Shift+Tab moves to just before the previous bracket or quote. A toolbar toggle is enabled by default and persists locally across problems and restarts.

| Check | Result |
| --- | --- |
| TypeScript and production build | Passed; Windows x64 NSIS installer generated |
| Unit tests | 56 passed, including five new delimiter-navigation tests; the existing coding suite also validated all 252 problem definitions and 3,775 reference cases |
| JavaScript boundaries | Real Monaco component and lexer passed nested/empty pairs, single/double quotes, escaped quotes, backticks, nested template expressions, multiline templates, comments, regex contents, UTF-16 positions and reverse navigation |
| Native editor behavior | Chromium keyboard checks passed autocomplete acceptance, forward/backward snippet placeholders, leading whitespace, no-target fallback, selected text, multiple cursors, Tab focus navigation, read-only mode and disabled TabOut |
| Edit integrity | Browser tests verified unchanged model contents/version during jumps and normal undo; Electron verified unchanged saved source and cursor placement with actual Tab/Shift+Tab input |
| Preference | Development and packaged Electron passed default enabled state, toggle fallback, persistence between problems and persistence after restart |
| Coding regression | Development and final packaged Electron passed offline Run/Submit/Stop, errors/timeouts, custom cases, keyboard Run, submission reopening, backups, navigation cancellation and immediate-close draft persistence |
| Debugger regression | Development and final packaged Electron passed suspension, breakpoints, stepping, Play/Pause/speed, read-only source, bounded history, custom cases, errors, Stop/Restart and cleanup |
| Layout | TabOut and Run/Debug/Submit controls fit at 100%, 125% and 150% zoom; native Electron screenshots inspected |
| v0.5.0 upgrade | Exact former installer payload seeded an isolated schema-3 profile; final packaged v0.5.1 preserved its record collections, guided answers/hints/position, walkthrough preference and paused reopening |
| Installer payload | Extracted app archive matches the packaged build exactly; application exercised offline with Node/Git absent from PATH |

The focused editor suite runs the actual CodeEditor component and JavaScript tokenizer in Chromium. Electron tests exercise native Tab/Shift+Tab behavior, persistence, scaling and the complete coding/debugger workflows. Navigation uses cached tokenization per document revision; unclassified/overlong lines retain native Tab behavior. Jumps are restricted to one cursor with no selection in the editable solution editor. Suggestions, snippets and focus navigation retain priority. The preference uses local storage independently of schema-3 study data and backups. There are no desktop API or study-data migrations in this release.

The 250-lesson, 750-prediction, 9,537-transition and full 3,775-case debugger-parity validations from v0.5.0 are documented in [the archived v0.5.0 report](desktop-validation-0.5.0.md). Those execution and visualization systems were not changed for v0.5.1; the full traversals were not repeated for this editor feature.

## Release artifact

- Installer: `release/LeetCode-Study-0.5.1-Setup.exe`
- Size: **115,908,533 bytes**
- Signature: **unsigned**
- Installer SHA-256: `A4E65E187C9517AE3C93AF45B2BA3C1F795DEF5A75392193D2A148D83CD11E95`
- Packaged `resources/app.asar` SHA-256: `91B9FC04A4F81CEC44BC2C39BAB03B383E51C3759F369D75725F9780982AF84F`

The installer remains configured to recreate the desktop shortcut during a manual reinstall and open the app afterward. Its NSIS installation/upgrade UI was not executed; tests launched the extracted payload with isolated data directories. The user's installed application and personal profile were left untouched. Code signing and automatic updates are not configured. Windows 10 remains a packaging target and was not tested on a separate machine.

Local ignored evidence under `test-results/` includes `release-0.5.1.json`, `tabout.json`, `coding-e2e.json`, `coding-packaged.json`, `debugger-e2e.json`, `debugger-packaged.json` and `operations-packaged.json`. Native layout captures are `coding-1.png`, `coding-1.25.png` and `coding-1.5.png`. The release manifest records installer/archive hashes and report timestamps. Test sources and the CI workflow are checked in; the workflow now also runs `npm run test:editor`. Hosted CI status is separate from these local checks.
