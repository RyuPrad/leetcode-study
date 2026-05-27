import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function collectConsoleErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function clickStep(page, id, times) {
  for (let i = 0; i < times; i++) {
    await page.locator(`#${id}`).click();
    await page.waitForTimeout(80);
  }
}

async function testTwoSum(page) {
  const file = path.join(root, "Array & Hashing/two_sum_visualizer.html");
  const errors = collectConsoleErrors(page);
  await page.goto(`file://${file}`);
  await clickStep(page, "btn-next", 6);
  await clickStep(page, "btn-prev", 2);
  await clickStep(page, "btn-next", 2);
  return errors;
}

async function testConcatenation(page) {
  const file = path.join(root, "Array & Hashing/concatenation_of_array_visualizer.html");
  const errors = collectConsoleErrors(page);
  await page.goto(`file://${file}`);
  // Through first and second write for i=0
  await clickStep(page, "btn-next", 5);
  const consoleText = await page.locator("#console-ui").innerText();
  if (!consoleText.includes("res")) {
    throw new Error("Concatenation console should display res");
  }
  return errors;
}

async function testBinarySearch(page) {
  const file = path.join(root, "Binary Search/binary_search_visualizer.html");
  const errors = collectConsoleErrors(page);
  await page.goto(`file://${file}`);
  await clickStep(page, "btn-next", 6);
  const hudText = await page.locator("#hud-ui").innerText();
  if (!hudText.includes("ans")) {
    throw new Error("Binary Search HUD should display ans");
  }
  return errors;
}

const browser = await chromium.launch();
const page = await browser.newPage();

const tests = [
  ["Two Sum", testTwoSum],
  ["Concatenation", testConcatenation],
  ["Binary Search", testBinarySearch],
];

let failed = false;
for (const [name, fn] of tests) {
  const errors = await fn(page);
  if (errors.length) {
    failed = true;
    console.error(`FAIL ${name}:`);
    errors.forEach((e) => console.error(" ", e));
  } else {
    console.log(`PASS ${name}`);
  }
}

await browser.close();
if (failed) process.exit(1);
console.log("All smoke tests passed.");
