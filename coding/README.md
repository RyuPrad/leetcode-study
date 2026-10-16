# Offline coding contracts

`problems.json` contains the 439 runtime definitions: original concise statements, JavaScript entry points, class methods, starters, visible examples with expected results, reference programs, and submission cases. The app loads these as bundled assets; no LeetCode account, remote judge, or installed language runtime is used.

`statements.mjs` and `cases.mjs` maintain statements and deterministic additional cases. Run `npx tsx scripts/author-coding.ts` after editing them. This refreshes definitions, checks input contracts, runs each reference, and updates displayed example results. References and starter signatures are maintained directly in `problems.json`. The optional `scripts/import-coding.mjs` is a one-time import aid for extracted visualizer code, not part of a build or regeneration workflow.

Each suite has 12 additional checks. Inputs vary independently of the visible presets. Generate Parentheses exhausts its eight allowed sizes; the two N-Queens problems exhaust their nine sizes and repeat small cases. Other suites contain at least ten distinct additional inputs. These finite practice suites are not the official LeetCode judge or a proof of correctness.

`validation.ts` defines argument and input checks, including custom case size limits. `harness.js` constructs lists, trees, graphs, and problem APIs inside the guest interpreter, then serializes results back to JSON. Mutating functions inspect the changed argument; random-list and graph clones must not share input nodes. Codec instances are separate for string encoding/decoding. `compare.ts` handles alternative valid answers, ordering, floating-point tolerance, and equivalent BST outputs.

`engine.ts` runs each reference and user case in separate QuickJS contexts, each with a fresh runtime, a 64 MiB allocation limit, a stack limit, and a 2 second interrupt deadline. Only a bounded console callback crosses into the worker. User code has no DOM, desktop IPC, filesystem, Node.js, network, or module loader. The desktop renderer owns a disposable worker with a 30 second job deadline and a case watchdog; Stop and navigation terminate it. No host JavaScript `eval` or Node `vm` runs user programs. JavaScript solutions are synchronous functions/classes.

`npm test` validates coverage, every reference case, incorrect implementations, semantic comparisons, adapters, resource limits, data migration, backups, and existing store/timer behavior. `npm run test:coding` exercises the real offline desktop editor and worker. Set `STUDY_TEST_EXE` to an installed executable to repeat it against the packaged app with Node and Git absent from PATH.

`instrument.ts`, `debug-runtime.js`, and `debug-engine.ts` implement live debugging in a separate QuickJS Asyncify worker. Babel keeps original source locations and inserts statement, condition, return, scope, and call-stack checkpoints. Lazy binding readers preserve shadowing, closures and temporal dead zones. Member calls retain their receiver and evaluation order. Scope/syntax budgets reject pathological instrumentation growth before the VM starts.

Snapshots contain plain data with stable object IDs. Descriptor inspection avoids user accessors; snapshot serialization also avoids inherited `toJSON` hooks. History is bounded independently of the 64 MiB VM. The debugger's 10-second active-time clock excludes suspension and Play delays. Continue samples intermediate checkpoints and retains final local values; Step/Play and breakpoints suspend the actual VM. Browsing history never rewinds execution. A dedicated worker is terminated on Stop, Restart, problem navigation, or close.

`npm run check:debugger` compares every example and submission case against the normal runner. `npm run test:debugger` exercises live desktop controls, source immutability, data diagrams, history, case selection, pause events, limits, cleanup and zoom. The QuickJS version is pinned because disposal currently includes a scoped workaround for its host-reference finalizer order; debugger tests also exercise cyclic closure cleanup.

## TypeScript, Java and C

`signatures.mjs` holds each problem's typed LeetCode contract in Java notation; `languages.ts` parses it and generates the TypeScript, Java and C starters and description contracts. `npm run check:signatures` checks every signature against `problems.json`: names, arity, every case input, and every reference output. Expected results always come from the JavaScript reference.

TypeScript is stripped to JavaScript by `typescript.ts` (Babel parser/traverse/generator, the same as the debugger uses) and then runs and debugs like JavaScript. Stripping keeps node locations, so errors and debugger lines point to the TypeScript source.

Java and C run in the desktop main process (`desktop/native-runner.ts`) with the toolchains from `scripts/fetch-toolchains.mjs`. `native/java/JudgeMain.java` compiles the solution in memory, converts arguments by reflection on the declared parameter types, and mirrors `harness.js` for lists, trees, graphs, design operations, codecs and interactive APIs. `c-harness.ts` generates one C program per job: LeetCode's prelude, the solution under `#line 1 "solution.c"`, and a harness that builds each case with LeetCode's C conventions and writes the result JSON. `npm run check:native` compiles and runs every generated Java and C starter. `tests/native.test.ts` judges hand-written solutions in `tests/fixtures/languages` on full submission suites, along with failure cases (wrong answer, crash, timeout, stack and memory limits, compile errors, Stop).

## Reference solutions

`solutions/{typescript,java,c}/<number>.{ts,java,c}` translate each problem's JavaScript `reference`, keeping its algorithm and variable names so they match the Visualizer. `npm run check:solutions` judges all 1,317 on their full submission suites, and must stay Accepted. The Code tab loads them lazily (`src/coding/solutions.ts`); `scripts/content.mjs` appends them, with the JavaScript reference, to each bundled note.

The Visualizer and Learn tabs can show these solutions instead of the JavaScript reference, highlighting the line that matches each step. `visualizer-ui/code-maps.json` maps every highlighted JavaScript line to a line of each solution; `0` marks a line with no counterpart, and `reviewed` lists the mappings a person checked. After changing a solution, run `node scripts/code-maps.mjs --author --refresh=<number>:<language>` to derive its new map, review it, and list the checked lines in `reviewed`. `npm run check:code-maps` fails until every line is mapped and every dissimilar or contested mapping is reviewed; the build writes the maps and solutions to `visualizer-ui/code-languages.js`.

## Is Graph Bipartite? (785)

The graph argument is a symmetric zero-based adjacency list with 1–100 vertices, distinct integer neighbors, and no self edges. Isolated vertices and disconnected components are valid. The original reference uses +1/-1 labels and an array queue with a head index. Three visible examples and twelve additional cases cover even/odd cycles, a later failing component, shared neighbors, isolated vertices, and neighbor-order independence. The teaching diagram separately caps input at 16 vertices.
