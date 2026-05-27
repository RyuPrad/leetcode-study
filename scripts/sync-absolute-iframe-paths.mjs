import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const EXCLUDED_DIRS = new Set([".git", "node_modules", ".obsidian"]);
const IFRAME_OPEN_TAG_RE = /<iframe\b[\s\S]*?(?:\/\s*>|>)/gi;
const IFRAME_SRC_IN_TAG_RE = /\bsrc\s*=\s*(["'])([\s\S]*?)\1/i;
const WINDOWS_ROOT_RE = /^[A-Za-z]:[\\/]/;

function parseArgs(argv) {
  const options = {
    check: false,
    root: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--check") {
      options.check = true;
    } else if (arg === "--root") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("--root requires a path argument");
      }
      options.root = next;
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function isWindowsRootPath(value) {
  return WINDOWS_ROOT_RE.test(value);
}

function resolveWalkRoot(explicitRoot) {
  if (process.platform === "win32" && explicitRoot) {
    return path.resolve(explicitRoot);
  }
  return path.resolve(process.cwd());
}

function resolveUrlRoot(explicitRoot) {
  if (explicitRoot) {
    return explicitRoot;
  }
  return path.resolve(process.cwd());
}

function assertWritablePlatform(walkRoot, explicitRoot) {
  if (process.platform === "win32") {
    return;
  }

  const rootLooksWindows = isWindowsRootPath(explicitRoot ?? walkRoot);
  if (!rootLooksWindows) {
    console.error(
      "This script is intended to generate Windows file:/// paths. Run it on Windows or pass --root C:\\path\\to\\vault."
    );
    process.exit(1);
  }
}

function walkMarkdownFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractHtmlFilename(src) {
  const trimmed = src.trim();
  if (!trimmed) {
    return null;
  }

  const withoutQuery = trimmed.split(/[?#]/, 1)[0];
  const parts = withoutQuery.split(/[/\\]/);
  const filename = parts.at(-1);

  if (!filename || !filename.toLowerCase().endsWith(".html")) {
    return null;
  }

  return filename;
}

function encodeWindowsPathSegments(segments) {
  return segments.map((segment) => encodeURIComponent(segment).replace(/'/g, "%27"));
}

function buildWindowsFileUrlFromRoot(rootPath, relativeVisualizerPath) {
  const normalizedRoot = rootPath.replace(/\\/g, "/").replace(/\/+$/, "");
  const normalizedRelative = relativeVisualizerPath.replace(/\\/g, "/").replace(/^\/+/, "");

  const segments = [
    ...normalizedRoot.split("/").filter(Boolean),
    ...normalizedRelative.split("/").filter(Boolean),
  ];

  if (segments.length === 0) {
    throw new Error("Cannot build file URL from empty path");
  }

  const drive = segments[0].replace(/\/+$/, "");
  const encodedRest = encodeWindowsPathSegments(segments.slice(1));
  return `file:///${drive}/${encodedRest.join("/")}`;
}

function toWindowsFileUrl(urlRoot, relativeVisualizerPath) {
  if (process.platform === "win32") {
    const absolutePath = path.resolve(urlRoot, relativeVisualizerPath);
    return pathToFileURL(absolutePath).href;
  }

  return buildWindowsFileUrlFromRoot(urlRoot, relativeVisualizerPath);
}

function normalizePathSegment(segment) {
  try {
    return decodeURIComponent(segment.replace(/\+/g, " "));
  } catch {
    return segment
      .replace(/%26/gi, "&")
      .replace(/%20/gi, " ")
      .replace(/%27/gi, "'");
  }
}

function normalizeFileUrlForCompare(url) {
  const trimmed = url.trim().replace(/\\/g, "/");
  const match = trimmed.match(/^file:\/\/\/(.+)$/i);
  if (!match) {
    return trimmed.toLowerCase();
  }

  const normalizedPath = match[1]
    .split("/")
    .map(normalizePathSegment)
    .join("/")
    .toLowerCase();

  return `file:///${normalizedPath}`;
}

function fileUrlsEquivalent(actual, expected) {
  return normalizeFileUrlForCompare(actual) === normalizeFileUrlForCompare(expected);
}

function replaceIframeSrcValues(content, replacements) {
  return content.replace(IFRAME_OPEN_TAG_RE, (tag, offset) => {
    const pending = replacements.find((entry) => entry.tagOffset === offset);
    if (!pending) {
      return tag;
    }

    return tag.replace(
      IFRAME_SRC_IN_TAG_RE,
      (_match, quote) => `src=${quote}${pending.newSrc}${quote}`
    );
  });
}

function processMarkdownFile(mdPath, walkRoot, urlRoot) {
  const content = fs.readFileSync(mdPath, "utf8");
  const mdDir = path.dirname(mdPath);
  const results = [];

  let match;
  IFRAME_OPEN_TAG_RE.lastIndex = 0;
  while ((match = IFRAME_OPEN_TAG_RE.exec(content)) !== null) {
    const tag = match[0];
    const tagOffset = match.index;
    const srcMatch = tag.match(IFRAME_SRC_IN_TAG_RE);

    if (!srcMatch) {
      results.push({
        type: "invalid",
        mdPath,
        srcValue: "(iframe missing src attribute)",
      });
      continue;
    }

    const srcValue = srcMatch[2];
    const htmlFilename = extractHtmlFilename(srcValue);

    if (!htmlFilename) {
      results.push({
        type: "invalid",
        mdPath,
        srcValue,
      });
      continue;
    }

    const visualizerRelativePath = path.relative(walkRoot, path.join(mdDir, htmlFilename));
    const visualizerAbsolutePath = path.resolve(walkRoot, visualizerRelativePath);

    if (!fs.existsSync(visualizerAbsolutePath)) {
      results.push({
        type: "missing",
        mdPath,
        htmlFilename,
        visualizerRelativePath,
        srcValue,
      });
      continue;
    }

    const expectedSrc = toWindowsFileUrl(urlRoot, visualizerRelativePath);

    if (fileUrlsEquivalent(srcValue, expectedSrc)) {
      results.push({
        type: "correct",
        mdPath,
        htmlFilename,
        srcValue,
        expectedSrc,
      });
      continue;
    }

    results.push({
      type: "update",
      mdPath,
      htmlFilename,
      srcValue,
      expectedSrc,
      tagOffset,
    });
  }

  return { content, results };
}

function printReport(report) {
  console.log("");
  console.log("Absolute iframe path sync report");
  console.log("================================");

  if (report.updated.length) {
    console.log("\nUpdated Markdown files:");
    for (const entry of report.updated) {
      console.log(`  ${entry.mdPath}`);
      console.log(`    ${entry.srcValue}`);
      console.log(`    -> ${entry.expectedSrc}`);
    }
  }

  if (report.correct.length) {
    console.log("\nAlready correct Markdown files:");
    for (const entry of report.correct) {
      console.log(`  ${entry.mdPath}`);
    }
  }

  if (report.missing.length) {
    console.log("\nMissing visualizer files:");
    for (const entry of report.missing) {
      console.log(`  ${entry.mdPath}`);
      console.log(`    expected: ${entry.visualizerRelativePath}`);
    }
  }

  if (report.invalid.length) {
    console.log("\nInvalid iframe src values:");
    for (const entry of report.invalid) {
      console.log(`  ${entry.mdPath}`);
      console.log(`    src="${entry.srcValue}"`);
    }
  }

  console.log("\nSummary");
  console.log(`  Total iframe count checked: ${report.totalIframes}`);
  console.log(`  Updated: ${report.updated.length}`);
  console.log(`  Already correct: ${report.correctFiles.size}`);
  console.log(`  Missing visualizers: ${report.missing.length}`);
  console.log(`  Invalid iframe src values: ${report.invalid.length}`);
}

function main() {
  const options = parseArgs(process.argv);
  const walkRoot = resolveWalkRoot(options.root);
  const urlRoot = resolveUrlRoot(options.root);
  assertWritablePlatform(walkRoot, options.root);

  const markdownFiles = walkMarkdownFiles(walkRoot);
  const report = {
    updated: [],
    correct: [],
    missing: [],
    invalid: [],
    correctFiles: new Set(),
    totalIframes: 0,
  };

  for (const mdPath of markdownFiles) {
    const { content, results } = processMarkdownFile(mdPath, walkRoot, urlRoot);
    const updatesForFile = results.filter((entry) => entry.type === "update");

    for (const entry of results) {
      report.totalIframes += 1;
      if (entry.type === "update") {
        report.updated.push(entry);
      } else if (entry.type === "correct") {
        report.correct.push(entry);
        report.correctFiles.add(entry.mdPath);
      } else if (entry.type === "missing") {
        report.missing.push(entry);
      } else if (entry.type === "invalid") {
        report.invalid.push(entry);
      }
    }

    if (!options.check && updatesForFile.length > 0) {
      const updatesWithNewSrc = updatesForFile.map((entry) => ({
        ...entry,
        newSrc: entry.expectedSrc,
      }));
      const nextContent = replaceIframeSrcValues(content, updatesWithNewSrc);
      fs.writeFileSync(mdPath, nextContent, "utf8");
    }
  }

  printReport(report);

  const hasProblems =
    report.updated.length > 0 || report.missing.length > 0 || report.invalid.length > 0;

  if (options.check && hasProblems) {
    process.exit(1);
  }
}

main();
