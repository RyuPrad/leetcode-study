import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPORTS_DIR = path.join(ROOT, "reports");
const EXCLUDED_DIRS = new Set([".git", "node_modules", ".obsidian"]);
const MAX_STEPS = 80;
const TEXT_LIMIT = 12000;

function normalizeCapturedText(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function limitText(text, max = TEXT_LIMIT) {
  const normalized = normalizeCapturedText(text);
  if (!normalized) return "";
  return normalized.length > max
    ? `${normalized.slice(0, max)}\n...[truncated]`
    : normalized;
}

function findHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function relativeFile(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

async function captureSnapshot(page) {
  return page.evaluate(() => {
    function text(selector) {
      const element = document.querySelector(selector);
      return element ? element.innerText.trim() : "";
    }

    function resultText() {
      const parts = [];
      for (const selector of [".result-card", ".result-value"]) {
        for (const element of document.querySelectorAll(selector)) {
          const value = element.innerText.trim();
          if (value) {
            parts.push(value);
          }
        }
      }
      return [...new Set(parts)].join("\n");
    }

    const visibleButtons = Array.from(document.querySelectorAll("button"))
      .filter((button) => {
        const style = window.getComputedStyle(button);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          button.offsetParent !== null
        );
      })
      .map((button) => ({
        id: button.id || null,
        text: button.innerText.trim(),
      }));

    return {
      title: document.title,
      heading: text("h1"),
      subtitle: text(".subtitle"),
      hudText: text("#hud-ui"),
      consoleText: text("#console-ui"),
      narrationText: text("#narration-ui"),
      traceText: text("#trace-ui"),
      resultText: resultText(),
      visibleButtons,
    };
  });
}

function limitSnapshotFields(snapshot) {
  return {
    ...snapshot,
    hudText: limitText(snapshot.hudText),
    consoleText: limitText(snapshot.consoleText),
    narrationText: limitText(snapshot.narrationText),
    traceText: limitText(snapshot.traceText),
    resultText: limitText(snapshot.resultText),
  };
}

async function getNextButtonState(page) {
  const nextButton = page.locator("#btn-next").first();
  if ((await nextButton.count()) === 0) {
    return null;
  }

  return {
    exists: true,
    disabled: await nextButton.isDisabled(),
    text: (await nextButton.innerText()).trim(),
  };
}

function shouldStopStepping(nextButtonState) {
  if (!nextButtonState) {
    return true;
  }
  if (nextButtonState.disabled) {
    return true;
  }
  if (/finished/i.test(nextButtonState.text)) {
    return true;
  }
  return false;
}

async function captureVisualizer(page, filePath) {
  const file = relativeFile(filePath);
  const fileErrors = [];

  await page.goto(pathToFileURL(filePath).href, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);

  const initialRaw = await captureSnapshot(page);
  const initial = limitSnapshotFields(initialRaw);

  const report = {
    file,
    title: initial.title,
    heading: initial.heading,
    subtitle: initial.subtitle,
    initial: {
      hudText: initial.hudText,
      consoleText: initial.consoleText,
      narrationText: initial.narrationText,
      traceText: initial.traceText,
      resultText: initial.resultText,
      visibleButtons: initial.visibleButtons,
    },
    stepMode: "btn-next",
    steps: [],
    afterStepBack: null,
    errors: fileErrors,
  };

  const nextButton = page.locator("#btn-next").first();
  if ((await nextButton.count()) === 0) {
    report.stepMode = "no btn-next found";
    report.finalSnapshot = {
      hudText: initial.hudText,
      consoleText: initial.consoleText,
      narrationText: initial.narrationText,
      traceText: initial.traceText,
      resultText: initial.resultText,
    };
    return report;
  }

  let step = 0;
  while (step < MAX_STEPS) {
    const nextButtonState = await getNextButtonState(page);
    if (shouldStopStepping(nextButtonState)) {
      break;
    }

    await nextButton.click();
    await page.waitForTimeout(80);
    step += 1;

    const snapshotRaw = await captureSnapshot(page);
    const snapshot = limitSnapshotFields(snapshotRaw);
    const afterClickState = await getNextButtonState(page);

    report.steps.push({
      step: step - 1,
      nextButtonText: afterClickState?.text ?? nextButtonState.text,
      hudText: snapshot.hudText,
      consoleText: snapshot.consoleText,
      narrationText: snapshot.narrationText,
      traceText: snapshot.traceText,
      resultText: snapshot.resultText,
    });
  }

  const finalRaw = await captureSnapshot(page);
  const finalSnapshot = limitSnapshotFields(finalRaw);
  report.finalSnapshot = {
    hudText: finalSnapshot.hudText,
    consoleText: finalSnapshot.consoleText,
    narrationText: finalSnapshot.narrationText,
    traceText: finalSnapshot.traceText,
    resultText: finalSnapshot.resultText,
  };

  if (report.steps.length >= 2) {
    const prevButton = page.locator("#btn-prev").first();
    if ((await prevButton.count()) > 0 && !(await prevButton.isDisabled())) {
      await prevButton.click();
      await page.waitForTimeout(80);
      const backRaw = await captureSnapshot(page);
      const backSnapshot = limitSnapshotFields(backRaw);
      report.afterStepBack = {
        hudText: backSnapshot.hudText,
        consoleText: backSnapshot.consoleText,
        narrationText: backSnapshot.narrationText,
        traceText: backSnapshot.traceText,
        resultText: backSnapshot.resultText,
      };
    }
  }

  return report;
}

function buildMarkdownReport(report) {
  const lines = [
    "# Visualizer Output Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Generated from ${report.visualizerCount} HTML visualizers.`,
    "",
  ];

  for (const visualizer of report.visualizers) {
    lines.push(`## ${visualizer.file}`);
    lines.push("");
    lines.push(`Title: ${visualizer.title || "(none)"}`);
    if (visualizer.heading) {
      lines.push(`Heading: ${visualizer.heading}`);
    }
    if (visualizer.subtitle) {
      lines.push(`Subtitle: ${visualizer.subtitle}`);
    }
    lines.push(`Step mode: ${visualizer.stepMode}`);
    lines.push("");

    lines.push("### Initial HUD");
    lines.push("");
    lines.push("```text");
    lines.push(visualizer.initial.hudText || "(empty)");
    lines.push("```");
    lines.push("");

    if (visualizer.initial.consoleText) {
      lines.push("### Initial Console");
      lines.push("");
      lines.push("```text");
      lines.push(visualizer.initial.consoleText);
      lines.push("```");
      lines.push("");
    }

    if (visualizer.initial.narrationText) {
      lines.push("### Initial Narration");
      lines.push("");
      lines.push("```text");
      lines.push(visualizer.initial.narrationText);
      lines.push("```");
      lines.push("");
    }

    if (visualizer.initial.traceText) {
      lines.push("### Initial Trace");
      lines.push("");
      lines.push("```text");
      lines.push(visualizer.initial.traceText);
      lines.push("```");
      lines.push("");
    }

    if (visualizer.steps.length > 0) {
      lines.push(`### Step Snapshots (${visualizer.steps.length})`);
      lines.push("");
      for (const step of visualizer.steps) {
        lines.push(`#### Step ${step.step} (next: ${step.nextButtonText})`);
        lines.push("");
        if (step.hudText) {
          lines.push("HUD:");
          lines.push("```text");
          lines.push(step.hudText);
          lines.push("```");
          lines.push("");
        }
        if (step.resultText) {
          lines.push("Result:");
          lines.push("```text");
          lines.push(step.resultText);
          lines.push("```");
          lines.push("");
        }
      }
    }

    if (visualizer.finalSnapshot) {
      lines.push("### Final Snapshot");
      lines.push("");
      if (visualizer.finalSnapshot.resultText) {
        lines.push(`return value: ${visualizer.finalSnapshot.resultText}`);
        lines.push("");
      }
      lines.push("HUD:");
      lines.push("```text");
      lines.push(visualizer.finalSnapshot.hudText || "(empty)");
      lines.push("```");
      lines.push("");
    }

    if (visualizer.afterStepBack) {
      lines.push("### After Step Back");
      lines.push("");
      lines.push("```text");
      lines.push(visualizer.afterStepBack.hudText || "(empty)");
      lines.push("```");
      lines.push("");
    }

    if (visualizer.initial.visibleButtons?.length) {
      lines.push("### Controls");
      lines.push("");
      for (const button of visualizer.initial.visibleButtons) {
        lines.push(`- ${button.id ? `#${button.id}` : "(no id)"}: ${button.text || "(empty)"}`);
      }
      lines.push("");
    }

    lines.push("### Errors");
    lines.push("");
    if (visualizer.errors.length === 0) {
      lines.push("None");
    } else {
      for (const error of visualizer.errors) {
        lines.push(`- ${error}`);
      }
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const htmlFiles = findHtmlFiles(ROOT).sort((a, b) => a.localeCompare(b));
  const visualizers = [];

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const filePath of htmlFiles) {
    const file = relativeFile(filePath);
    const fileErrors = [];
    let currentFile = file;

    const onPageError = (error) => {
      fileErrors.push(`pageerror: ${error.message}`);
    };
    const onConsole = (message) => {
      if (message.type() === "error") {
        fileErrors.push(`console.error: ${message.text()}`);
      }
    };

    page.on("pageerror", onPageError);
    page.on("console", onConsole);

    try {
      console.log(`Capturing ${currentFile}...`);
      const report = await captureVisualizer(page, filePath);
      report.errors = fileErrors;
      visualizers.push(report);
    } catch (error) {
      visualizers.push({
        file,
        title: "",
        heading: "",
        subtitle: "",
        initial: {
          hudText: "",
          consoleText: "",
          narrationText: "",
          traceText: "",
          resultText: "",
          visibleButtons: [],
        },
        stepMode: "capture failed",
        steps: [],
        afterStepBack: null,
        finalSnapshot: null,
        errors: [...fileErrors, String(error)],
      });
    } finally {
      page.off("pageerror", onPageError);
      page.off("console", onConsole);
    }
  }

  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    visualizerCount: visualizers.length,
    visualizers,
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORTS_DIR, "visualizer-output-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(REPORTS_DIR, "visualizer-output-report.md"),
    buildMarkdownReport(report),
    "utf8"
  );

  const withErrors = visualizers.filter((entry) => entry.errors.length > 0);
  console.log("");
  console.log(`Captured ${visualizers.length} visualizers.`);
  console.log(`Reports written to ${path.relative(ROOT, REPORTS_DIR)}/`);
  console.log(`Visualizers with errors: ${withErrors.length}`);
  if (withErrors.length) {
    for (const entry of withErrors) {
      console.log(`  ${entry.file}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
