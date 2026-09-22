# LeetCode Study

An offline Windows workspace for understanding algorithms, with **252 problem notes, 250 interactive visualizers, a JavaScript coding workspace for all 252 problems, 20 topics, and two reference guides**. Built from the original leetcode-obsidian library.

Browse and search the bundled library, step through algorithms, inspect live variables, and keep a private practice history. No Obsidian, account, Git, or Node installation is needed to use the packaged app.

## Using the app

Install `LeetCode-Study-0.5.1-Setup.exe` from the build's Windows artifact. The installer is per-user, restores the desktop shortcut during a manual reinstall, and opens the app when installation finishes. This build is unsigned; code signing and automatic updates are not configured. Install a newer version over the old one to update. Progress stays in your Windows user profile, independently of the installed content, and uninstalling retains it.

- **Library:** search by number, title, topic, or note text; filter by progress; browse bookmarks and the review queue.
- **Learn:** all 250 visualizers have a fixed guided example with three authored predictions (750 in total). Read the question beside the diagram and reference code, choose an answer or an outlined diagram item, ask for either of two hints, or choose Show me. Watch the change and read why it works. Basics explanations cover the actual JavaScript being used. Answers and position save automatically; returning starts paused. Guided completion is separate from solving the coding problem.
- **Visualizer:** all 250 lessons include a problem-specific explanation, before/after changes, consistent colors and symbols, movement animations, and timeline seeking. Resize the diagram beside the reference code, focus the diagram, zoom/Fit, or Alt-drag to pan. Precomputed lessons expose the full timeline; stateful lessons build their timeline as you step or play. Examples, custom inputs, reset, fullscreen, pinned variables, and the execution inspector remain available. Motion can be disabled and follows Windows reduced-motion preferences.
- **Playback:** Play advances from the current step; Pause keeps your place. Choose 0.5×, 1×, 2×, or 4×; Compact mode advances once per second at 1×; Detailed mode holds each explanation moment for two seconds. At completion, Replay restarts the current example. Manual steps, reset, input changes, switching views, opening dialogs, and leaving/minimizing the app pause playback. Press Play to resume. Speed stays selected until you close that visualizer; reopening starts at 1×.
- **Code:** write JavaScript in the offline Monaco editor. Run examples or custom JSON cases; Submit checks the bundled local suite. Stop cancels execution. Drafts save automatically, and submission history preserves the source and results of each attempt. Reset and reopening a submission ask before replacing the current draft. Switching to Code pauses the reference visualizer.
- **Debug:** pause your own JavaScript in all 252 problems. Choose an example or custom case, set gutter breakpoints, and Continue, Step Into/Over/Out, or Play at an adjustable speed. Inspect scopes, recursive calls, arrays, indexed strings, matrices, maps, sets, heaps, linked nodes, trees, and graphs. Read/write highlights and before/after changes follow actual execution; object IDs preserve aliases and cycles. Source stays read-only until Stop / edit.
- **Notes:** solutions, variable tables, and reference links. Problems 700 and 933 have notes and a Code tab.
- **History:** study time is recorded while a problem is open and the window is active. Tracking pauses when you leave the app, minimize, lock/suspend Windows, or stop interacting for five minutes. Edit a session to correct its duration, set an outcome, add a reflection, or delete it.
- **Progress:** opening a problem marks it In progress. Mark it Completed explicitly, choose Solved when editing a session, or pass a local Submit. Run and failed submissions do not change completion. Needs review is an independent flag.
- **Backup:** export your data, or restore a validated backup. Restore previews its contents, asks before replacing existing records, and archives the previous data.

Shortcuts: **Ctrl+K** searches; **Left/Right** step through a visualizer outside input fields; **Ctrl+Enter** runs code; **Ctrl+Shift+Enter** submits to local tests; **Ctrl +/-** changes zoom. Press **Alt** for the native application menu.

## Running code

Open a problem and select **Code**. Keep the provided function/class name and edit its body. Custom tests use JSON arrays of argument arrays, such as `[[[2,7,11,15],9],[[3,2,4],6]]` for Two Sum. Trees use level-order arrays with `null`; lists use value arrays; design problems use matching operations/arguments arrays. The description shows each contract.

Results show output, expected output, console messages, execution time, and error locations. Each test starts in a fresh QuickJS interpreter inside a disposable worker with a 2 second time limit and 64 MiB memory limit; jobs stop at 30 seconds. Console and result sizes are bounded. Code has no filesystem, Node.js, desktop bridge, or network access.

This is **JavaScript-only local practice** with bundled tests, not the official LeetCode backend. Tests accept equivalent valid answers where a problem allows them. The Visualizer is a reference walkthrough; **Code → Debug** visualizes the code you type.

## TabOut while writing code

**TabOut** is on by default in the Code toolbar. **Tab** moves past the next closing parenthesis, square bracket, brace or quote on the current line, even with text ahead. **Shift+Tab** moves to just before the previous bracket or quote. Repeated presses move through nested boundaries one at a time. Single/double quotes and backticks are supported, including template expressions; escaped quotes, comments and regex contents do not become navigation targets.

For example, `console.log("hel|lo");` becomes `console.log("hello"|);` after Tab, then `console.log("hello")|;` after another Tab (`|` marks the cursor). Navigation does not edit your code or add an undo entry.

Autocomplete, snippet placeholders, selected-text indentation, multiple cursors and Tab focus navigation keep their normal behavior. Leading whitespace and lines with no eligible boundary use normal indentation. Use **TabOut On/Off** to disable both directions. The choice persists across problems and restarts, separately from study-data backups. Debug source remains read-only and uses its existing shortcuts.

## Guided visual learning

Open a problem and select **Learn**. The question, diagram, and reference code have separate scrollable panes. At larger zoom levels, the sidebar collapses to make room; its button can expand it again. Resize the diagram/code divider with the mouse or its arrow keys. Diagram zoom, Fit, panning, and reduced motion remain available.

**Next prediction** skips ordinary steps but stops before the first unanswered question. Play also pauses there. A correct answer unlocks **Watch the change**; **Show me** demonstrates it directly. Incorrect answers give feedback and can be retried. The two hints become progressively more specific. **Explain the code** and the concept glossary explain syntax without appending the prediction answer. Full reference code is visible throughout.

The timeline can review earlier states. Restart creates a fresh attempt while preserving previous completion. Lesson progress stores attempts, hints, revealed answers, and the paused position in your local profile and backups. Updated lesson content restarts that walkthrough and retains any earlier completion. The Visualizer tab provides other presets and custom inputs; guided lessons use one authored example. Problems 700 and 933 still have Notes and Code, without a Learn tab.

## Detailed walkthroughs

Learn, Visualizer, and Debug open in **Detailed walkthrough** mode. An operation is presented as **Focus**, **Action**, and **Result**. Play advances automatically with a two-second dwell per moment at 1x; the speed selector scales that delay. Pause freezes the current moment, and Previous/Next moment review it without executing the instruction again. Whole-step controls and Next prediction remain available.

Checks and reads stay in place; a lookup never draws an insertion arrow. Writes, comparisons, removals and reference changes have explicit action labels. Two Sum labels map numbers and their original array indices, reports a lookup only after the check runs, and labels the actual insertion arrow. Other arrows are shown only where a relationship is established. Tree and list connections remain structural links.

The current explanation remains visible in Learn between questions. Prediction barriers still apply before any result is revealed. Reference code remains alongside the diagram. Choose **Compact walkthrough** to collapse the extra moments while retaining the clearer labels. This display preference is saved locally and shared across views; it is not part of study-data backups. Reopening always starts paused at the last saved algorithm step.

Debug Play waits for presentation to finish before continuing execution. That wait is excluded from its execution timeout. Continue and Step Into/Over/Out retain their normal debugger meanings. Observations show their own source lines; the next-statement indicator still identifies where execution will resume.

## Live debugging

Debugging uses a dedicated QuickJS Asyncify worker with source instrumentation. It suspends execution at real checkpoints. **F9** toggles a breakpoint, **F5** continues, **F10** steps over, **F11** steps into, **Shift+F11** steps out, and **Shift+F5** stops. Hollow breakpoints indicate a line with no executable statement. Selecting another case or Restart creates a new execution. Debugging never submits or marks a problem completed.

A source line can contain several checkpoints. A **Next statement** checkpoint pauses before that statement; a **Decision** checkpoint shows the condition just evaluated. Loop-header breakpoints are revisited on subsequent iterations.

The history slider inspects immutable past snapshots. **Return to live** resumes inspection of the suspended VM; scrubbing does not rewind it. Play records every checkpoint, while Continue samples intermediate history and stops at every breakpoint. The oldest history is evicted after 5,000 frames or 32 MiB. Large snapshots label omitted entries. Switching tabs, opening dialogs, minimizing, losing focus, and Windows suspend/lock pause execution; returning does not resume automatically. Leaving the problem or closing the app stops the worker.

Synchronous algorithm JavaScript is supported. Async functions, generators, Promises, `eval`, dynamic `Function` construction, `Proxy`, and `with` receive diagnostics. Inspection reads data descriptors without invoking getters or `toJSON`. Debugging has a 64 MiB VM limit and a 10-second **active execution** budget that excludes time waiting at breakpoints or between Play steps. Run and Submit retain their existing execution limits.

Instrumentation also bounds syntax-tree size and scope captures before execution, with a diagnostic for unusually large programs. Inspection presents own string-keyed data properties; private fields and internal slots are not exposed.

Diagrams show observed values and relationships. Array-to-heap view is an optional interpretation; temporary arrows require an explicit relationship. Observed reads and changes are otherwise highlighted independently. Strings use JavaScript's UTF-16 indices. For large inputs, use a smaller custom case to see more detail.

## Development

Use Windows 10/11 x64 and Node.js 24:

```powershell
npm ci --ignore-scripts
npm run setup
npm run dev
```

Setup downloads Electron and the Chromium test browser. The renderer reloads during development; restart `npm run dev` after changing desktop code, content, or shared visualizer assets.

```powershell
npm run check:content
npm test
npm run test:visualizers
npm run test:lessons
npm run test:guided
npm run test:operations
npm run test:inputs
npm run test:playback
npm run build
npm run test:e2e
npm run test:coding
npm run test:editor
npm run check:debugger
npm run test:debugger
npm run test:guided:desktop
npm run dist:win
```

The installer is written to `release/`. The Windows CI workflow runs validation and uploads an installer artifact; it does not publish releases. `npm start` launches the most recent build.

## Project structure

- `src/`: React study workspace.
- `desktop/`: Electron window, restricted asset protocol and IPC, atomic local store, and automatic session timer.
- `shared/`: catalog, progress, sessions, coding, and desktop API contracts.
- `coding/`: all 252 maintained problem definitions, test suites, guest adapters, input validation, and result comparators. See [coding contracts](coding/README.md).
- Topic folders: source Markdown and visualizers, with portable relative iframe references.
- `visualizer-ui/`: shared design and adapters used by all 250 visualizers, including in a standalone browser.
- `scripts/content.mjs`: validates and bundles the library. Add notes/visualizers to a topic folder and rebuild. IDs derive from problem numbers, so renames do not lose progress.

Installed content is read-only; update source files and rebuild to distribute changes. Notes support GitHub-flavored Markdown and wiki links. External web links open in the system browser.

The app and visualizers use separate origins. Visualizers have no Node.js access or desktop bridge. Only known bundled assets are served. Packaged app network requests are blocked; external links are explicitly limited to HTTP(S).

## Data and recovery

Data is stored in `%APPDATA%\LeetCode Study\study-data.json`, with atomic writes and a `.bak` recovery copy. Sessions are checkpointed every 15 seconds. After interruption, saved time is recovered without counting downtime. Backup restore saves the previous data to `study-data.json.before-import-*.json`.

Version 3 backups contain progress, history, reflections, code drafts, custom cases, submissions, and guided lesson progress, but not the library. Version 1 and 2 profiles migrate automatically with exact archived originals (`study-data.json.v1-*.json` or `study-data.json.v2-*.json`). Both older backup formats remain importable; missing coding or guided fields start empty. Draft edits reach the main process immediately; disk writes are batched and flushed on navigation, export, and normal close. Unsupported or malformed backups are rejected before data is changed. Records for problems absent from the installed library are retained for compatibility between library versions.

For isolated testing, `STUDY_DATA_DIR` selects another data directory and `STUDY_HEADLESS=1` suppresses the window. Neither is required for normal use.

## Visualizer validation

`npm run test:visualizers` loads every visualizer, compares initial/forward/back/reset/final states against the original library, checks completion, and rejects browser errors. Fixtures cover code highlights, diagrams, variables, narration, traces, and legacy object views. Documented corrections cover the original rendering errors in Find the Town Judge and Merge k Sorted Lists, plus reset behavior where working arrays previously replaced the original input.

`npm run test:playback` compares automatic and manual execution across all 250 visualizers, checks completion/replay, speed changes and pause behavior, and verifies repeated replay of custom inputs in the five pages with corrected reset behavior. Desktop integration tests additionally cover view changes, dialogs, window focus, power events, and playback controls at 100%, 125%, and 150% display scaling.

`npm run test:lessons` verifies all 250 state adapters, backward/forward seeking, final states, teaching notes, diagram entities, and representative family screenshots. Traversal trace assertions prevent duplicate visits. `npm run check:debugger` compares all 3,775 bundled cases against the normal runner across 252 problems. Debugger unit and Electron tests cover language semantics, suspension, breakpoints, stepping, cycles/aliases, safe inspection, limits, history, playback, cleanup, and display scaling. Teaching metadata is checked during every build; regenerate adapters with `node scripts/attach-lessons.mjs` after editing lesson metadata.

Original behavior fixtures are checked in under `tests/fixtures/`. The optional `--baseline` capture mode expects an untouched original checkout in `.baseline/content`; it is for deliberate fixture maintenance. `scripts/migrate-content.mjs` is the idempotent original-vault migration.

`npm run smoke` runs the three small legacy checks. `npm run capture:outputs` produces detailed HUD/console/narration reports in `reports/`; this longer diagnostic command uses the catalog to exclude app and build files.

`npm run test:guided` traverses all 750 authored checkpoints, verifies actual before/after values, correct and incorrect answers, hints, reveals, navigation barriers, code references, clickable targets, and restart behavior. Focused controls tests cover forward-seek completion, keyboard resizing, error recovery, and lesson-version changes. The desktop suite checks saved progress, offline operation, backups, focus/power pauses, keyboard search, and scaling.

Guided content is authored in `scripts/author-guided-a.mjs`, `scripts/author-guided-b.mjs`, and `scripts/author-guided-b-late.mjs`; the checked-in content shards are validated during every build. To intentionally revise content, capture current traces with `node scripts/capture-guided-traces.mjs`, update the authored questions, compile shard A with `node scripts/compile-guided-a.mjs` and shard B with `node scripts/author-guided-b.mjs`, then run the full guided suite. Increment each changed lesson version when distributing a revision. The generated offline JavaScript bundle is ignored and recreated by the build.

Operation descriptions are compiled from the reference JavaScript into checked-in `visualizer-ui/operations.json`, using explicit per-line rules and real state values rather than CSS colors. After intentionally changing reference code, capture traces, run `node scripts/author-operations.mjs`, and rerun `npm run test:operations`. The build validates all 250 operation sets and creates the ignored offline JavaScript bundle. The operation suite covers every default reference transition, lookup/write distinctions, source locations, replay without double execution, and Detailed/Compact playback timing.

`npm run test:editor` uses the actual CodeEditor component and JavaScript tokenizer in Chromium to check TabOut boundaries, keyboard fallback behavior, suggestions, snippets, focus navigation and undo. Coding desktop tests also exercise Tab/Shift+Tab in Electron, unchanged drafts during jumps, preference persistence and toolbar scaling. Lines for which the editor has skipped tokenization retain native Tab behavior.
