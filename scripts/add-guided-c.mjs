// Append-only Guided writer for problems added after the original library (shard C).
//   node scripts/add-guided-c.mjs <problem number> [...more]
// Binds each requested problem's rows in scripts/author-guided-c.mjs to its reference trace,
// .test-data/guided-authoring/<n>.json, with scripts/guided-binding.mjs, and appends the lessons
// to visualizer-ui/guided-content-c.json at version 1. Existing entries keep their exact bytes:
// the new entries are spliced in before the closing bracket. It refuses, writing nothing, if any
// requested problem already has a Guided lesson in any shard, is assigned to shard A or B by
// scripts/guided-shards.mjs, or lacks its catalog entry, authored rows or trace. Reviewed lessons
// are revised in place instead; see README.md, "Maintaining Guided content".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authorAdded } from './author-guided-c.mjs';
import { compileLesson } from './guided-binding.mjs';
import { SHARDS, shardOf } from './guided-shards.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = 'visualizer-ui/guided-content-c.json';
const USAGE = 'Usage: node scripts/add-guided-c.mjs <problem number> [...more]';
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const numberOf = lesson => Number(lesson.id.split(':')[1]);

function refuse(reasons) {
  console.error(`Refused; no Guided content was written.\n${reasons.map(reason => `- ${reason}`).join('\n')}`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (!args.length) refuse([USAGE]);
const invalid = args.filter(arg => !/^[1-9]\d{0,4}$/.test(arg));
if (invalid.length) refuse([`Expected problem numbers only, got ${invalid.map(arg => JSON.stringify(arg)).join(', ')}. ${USAGE}`]);
const numbers = [...new Set(args.map(Number))].sort((a, b) => a - b);
if (numbers.length !== args.length) refuse(['Each problem number may be requested once.']);

let text, current, catalog;
const owner = new Map();
try {
  text = read(TARGET);
  current = JSON.parse(text);
  if (!Array.isArray(current) || !/\]\s*$/.test(text)) throw Error(`${TARGET} is not a JSON array`);
  for (const shard of SHARDS)
    for (const lesson of shard === 'c' ? current : JSON.parse(read(`visualizer-ui/guided-content-${shard}.json`))) owner.set(numberOf(lesson), shard);
  catalog = new Map(JSON.parse(read('visualizer-ui/lessons.json')).map(spec => [spec.number, spec]));
} catch (error) {
  refuse([`Cannot read the current Guided shards and catalog: ${error.message}`]);
}
const authored = new Map(), repeated = new Set();
authorAdded((number, intro, commonMistake, rows) => {
  if (authored.has(number)) repeated.add(number);
  authored.set(number, { intro, commonMistake, rows });
});

const reasons = [], lessons = [];
for (const number of numbers) {
  const shard = shardOf(number), spec = catalog.get(number);
  const tracePath = `.test-data/guided-authoring/${number}.json`;
  if (shard !== 'c') reasons.push(`${number} is assigned to shard ${shard.toUpperCase()} by scripts/guided-shards.mjs; revise its reviewed lesson in place and increment its version.`);
  else if (owner.has(number)) reasons.push(`${number} already has a reviewed lesson in visualizer-ui/guided-content-${owner.get(number)}.json; revise it in place and increment its version.`);
  else if (!spec) reasons.push(`${number} has no visualizer entry in visualizer-ui/lessons.json.`);
  else if (!authored.has(number)) reasons.push(`${number} has no authored rows in scripts/author-guided-c.mjs.`);
  else if (repeated.has(number)) reasons.push(`${number} is authored more than once in scripts/author-guided-c.mjs.`);
  else if (!fs.existsSync(path.join(ROOT, tracePath))) reasons.push(`${number} has no reference trace at ${tracePath}; capture it with node scripts/capture-guided-traces.mjs ${number}.`);
  else {
    try {
      const trace = JSON.parse(read(tracePath));
      if (trace.id !== spec.id) throw Error(`${tracePath} was captured for ${trace.id}, not ${spec.id}`);
      lessons.push(compileLesson(spec, authored.get(number), trace));
    } catch (error) {
      reasons.push(`${number} could not be bound: ${error.message}`);
    }
  }
}
if (reasons.length) refuse(reasons);

// Keep every existing byte; only the closing bracket moves after the appended lessons.
const eol = text.includes('\r\n') ? '\r\n' : '\n';
const head = text.slice(0, text.search(/\s*\]\s*$/));
const entry = lesson => JSON.stringify(lesson, null, 2).split('\n').map(line => `  ${line}`).join(eol);
const output = `${head}${current.length ? ',' : ''}${eol}${lessons.map(entry).join(`,${eol}`)}${eol}]${eol}`;
const written = JSON.parse(output);
if (written.length !== current.length + lessons.length
  || current.some((lesson, index) => JSON.stringify(written[index]) !== JSON.stringify(lesson))
  || lessons.some((lesson, index) => JSON.stringify(written[current.length + index]) !== JSON.stringify(lesson)))
  refuse(['Internal check failed: the appended shard would not preserve the existing lessons.']);

// Write a sibling file and rename it over the shard, so an interrupted run leaves it intact.
const target = path.join(ROOT, TARGET), temporary = `${target}.${process.pid}.tmp`;
let created = false;
try {
  fs.writeFileSync(temporary, output, { flag: 'wx', mode: fs.statSync(target).mode });
  created = true;
  fs.renameSync(temporary, target);
} catch (error) {
  if (created) fs.rmSync(temporary, { force: true });
  refuse([`Cannot write ${TARGET}: ${error.message}`]);
}
console.log(`Appended ${lessons.length} Guided lesson${lessons.length === 1 ? '' : 's'} at version 1 to ${TARGET}: ${lessons.map(lesson => lesson.id).join(', ')}.`);
console.log('Review the diff, then run npm run check:guided and npm run test:guided.');
