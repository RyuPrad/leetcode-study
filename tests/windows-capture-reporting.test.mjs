/**
 * Dependency-free regression tests for the actual capture script.
 * Run: node --test tests/windows-capture-reporting.test.mjs
 * The filesystem, Playwright page, waits, and process are mocked. No browser is
 * launched, no report files are written, and browser rendering is not tested.
 */
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const sourceOption = process.argv.indexOf('--source');
const scriptUrl = sourceOption < 0 ? new URL('../scripts/capture-visualizer-outputs.mjs', import.meta.url)
  : pathToFileURL(path.join(path.resolve(process.argv[sourceOption + 1]), 'scripts/capture-visualizer-outputs.mjs'));
const root = path.dirname(path.dirname(fileURLToPath(scriptUrl)));
const source = fs.readFileSync(scriptUrl, "utf8");
// Only replace module wiring. Keep captureVisualizer(), main(), their entry
// point, report generation, and error/exit handling exactly as implemented.
const executable = source
  .replace(/^import .+;\r?\n/gm, "")
  .replaceAll("import.meta.url", "captureScriptUrl");
const maxSteps = Number(source.match(/const MAX_STEPS = (\d+);/)[1]);
const capError = `Hit MAX_STEPS=${maxSteps} before visualizer finished`;

async function runCapture(fixtures) {
  const page = new EventEmitter();
  const writes = new Map();
  const visits = [];
  const clicks = new Map();
  const logs = [];
  const fatalErrors = [];
  const processMock = { exitCode: 0, exit: (code) => assert.fail(`Unexpected process.exit(${code})`) };
  let current;
  let step;
  let closed = false;

  const complete = () => step >= (current.finishAt ?? 2);
  page.goto = async (url) => {
    visits.push(url);
    const filename = path.relative(root, fileURLToPath(url));
    current = fixtures.find((fixture) => fixture.file === filename);
    assert.ok(current, `Unexpected navigation: ${url}`);
    step = 0;
    clicks.set(filename, 0);
    if (current.pageError) page.emit("pageerror", new Error(current.pageError));
    if (current.consoleError) {
      page.emit("console", { type: () => "error", text: () => current.consoleError });
    }
    page.emit("console", { type: () => "log", text: () => "Informational message" });
    if (current.throwOnGoto) throw new Error(current.throwOnGoto);
  };
  page.waitForTimeout = async () => {};
  page.evaluate = async (callback) => callback();
  page.locator = (selector) => {
    assert.ok(["#btn-next", "#btn-prev"].includes(selector));
    return {
      first() { return this; },
      async count() {
        if (selector === "#btn-prev" || current.noNext) return 0;
        return current.finishMode === "removed" && complete() ? 0 : 1;
      },
      async isDisabled() {
        return (current.finishMode ?? "disabled") === "disabled" && complete();
      },
      async innerText() {
        return current.finishMode === "finished" && complete() ? "Finished" : "Next";
      },
      async click() {
        assert.equal(selector, "#btn-next");
        assert.ok(!complete(), "Must not advance after completion");
        step += 1;
        clicks.set(current.file, step);
      },
    };
  };

  const context = vm.createContext({
    captureScriptUrl: scriptUrl.href,
    collectCatalog: () => ({visualizers: fixtures.map(f => f.file)}),
    path, fileURLToPath, pathToFileURL,
    fs: {
      readdirSync(directory, options) {
        assert.equal(directory, root);
        assert.equal(options.withFileTypes, true);
        return fixtures.map(({ file }) => ({
          name: file, isDirectory: () => false, isFile: () => true,
        }));
      },
      mkdirSync(directory, options) {
        assert.equal(directory, path.join(root, "reports"));
        assert.equal(options.recursive, true);
      },
      writeFileSync(filename, content, encoding) {
        assert.equal(encoding, "utf8");
        assert.equal(path.dirname(filename), path.join(root, "reports"));
        assert.equal(closed, true, "Browser closes before writing reports");
        writes.set(path.basename(filename), content);
      },
    },
    chromium: { launch: async () => ({
      newPage: async () => page,
      close: async () => { closed = true; },
    }) },
    document: {
      title: "Test visualizer",
      querySelector: (selector) => selector === "#hud-ui" ? { innerText: `Step ${step}` } : null,
      querySelectorAll: () => [],
    },
    window: { getComputedStyle: () => ({ display: "block", visibility: "visible" }) },
    process: processMock,
    console: {
      log: (...args) => logs.push(args.join(" ")),
      error: (...args) => fatalErrors.push(args.join(" ")),
    },
  });
  await new vm.Script(executable, { filename: fileURLToPath(scriptUrl) }).runInContext(context);
  assert.deepEqual(fatalErrors, [], "No unhandled capture failure");
  assert.equal(page.listenerCount("pageerror"), 0);
  assert.equal(page.listenerCount("console"), 0);
  assert.equal(closed, true);
  assert.equal(writes.size, 2, "Both reports are written even on capture failure");
  return {
    report: JSON.parse(writes.get("visualizer-output-report.json")),
    markdown: writes.get("visualizer-output-report.md"),
    exitCode: processMock.exitCode,
    logs, visits, clicks,
  };
}

test("an unfinished visualizer keeps its step-cap error in both reports and fails the run", async () => {
  const run = await runCapture([{ file: "unfinished.html", finishAt: maxSteps + 1 }]);
  assert.equal(run.clicks.get("unfinished.html"), maxSteps);
  assert.deepEqual(run.report.visualizers[0].errors, [capError]);
  assert.equal(run.report.summary.visualizersWithErrors, 1);
  assert.deepEqual(run.report.summary.visualizersAtMaxStepLimit, ["unfinished.html"]);
  assert.ok(run.markdown.includes(`- ${capError}`));
  assert.ok(run.logs.includes("Visualizers with errors: 1"));
  assert.equal(run.exitCode, 1);
});

for (const finishMode of ["disabled", "finished", "removed"]) {
  test(`completion exactly at the step cap is successful (${finishMode})`, async () => {
    const run = await runCapture([{ file: "boundary.html", finishAt: maxSteps, finishMode }]);
    assert.equal(run.clicks.get("boundary.html"), maxSteps);
    assert.deepEqual(run.report.visualizers[0].errors, []);
    assert.equal(run.report.summary.visualizersWithErrors, 0);
    assert.equal(run.report.summary.maxStepsUsed, maxSteps);
    assert.ok(!run.markdown.includes(capError));
    assert.ok(run.logs.includes("Visualizers with errors: 0"));
    assert.equal(run.exitCode, 0);
  });
}

test("step-cap, console, and page errors are merged without leaking to another file", async () => {
  const run = await runCapture([
    { file: "a-failing.html", finishAt: maxSteps + 1, pageError: "Page broke", consoleError: "Console broke" },
    { file: "b-clean.html" },
  ]);
  assert.deepEqual(run.report.visualizers[0].errors, ["pageerror: Page broke", "console.error: Console broke", capError]);
  assert.deepEqual(run.report.visualizers[1].errors, []);
  assert.equal(run.report.summary.visualizerCount, 2);
  assert.equal(run.report.summary.visualizersWithErrors, 1);
  assert.equal(run.report.summary.totalStepSnapshots, maxSteps + 2);
  assert.equal(run.exitCode, 1);
});

for (const errorType of ["pageError", "consoleError"]) {
  test(`${errorType} alone makes the final summary fail`, async () => {
    const run = await runCapture([{ file: "runtime-error.html", [errorType]: "Runtime failure" }]);
    const prefix = errorType === "pageError" ? "pageerror" : "console.error";
    assert.deepEqual(run.report.visualizers[0].errors, [`${prefix}: Runtime failure`]);
    assert.equal(run.report.summary.visualizersWithErrors, 1);
    assert.ok(run.logs.includes("Visualizers with errors: 1"));
    assert.equal(run.exitCode, 1);
  });
}

test("a thrown capture failure preserves runtime errors, writes reports, and fails the run", async () => {
  const run = await runCapture([
    { file: "a-throws.html", throwOnGoto: "Navigation failed", consoleError: "Before throw" },
    { file: "b-clean.html" },
  ]);
  assert.equal(run.report.visualizers[0].stepMode, "capture failed");
  assert.deepEqual(run.report.visualizers[0].errors, ["console.error: Before throw", "Error: Navigation failed"]);
  assert.deepEqual(run.report.visualizers[1].errors, []);
  assert.equal(run.report.summary.visualizersWithErrors, 1);
  assert.equal(run.exitCode, 1);
});

test("a successful short capture keeps offline file URLs and reports success", async () => {
  const file = "spaces & hash# percent%.html";
  const run = await runCapture([{ file }]);
  assert.deepEqual(run.visits, [pathToFileURL(path.join(root, file)).href]);
  assert.equal(run.report.visualizers[0].file, file);
  assert.equal(run.report.summary.maxStepsUsed, 2);
  assert.deepEqual(run.report.summary.visualizersAtMaxStepLimit, []);
  assert.equal(run.exitCode, 0);
});

test("a visualizer without a Next button remains a successful static capture", async () => {
  const run = await runCapture([{ file: "static.html", noNext: true }]);
  assert.equal(run.report.visualizers[0].stepMode, "no btn-next found");
  assert.equal(run.report.visualizers[0].steps.length, 0);
  assert.deepEqual(run.report.visualizers[0].errors, []);
  assert.equal(run.exitCode, 0);
});
