/* The fixes must retain the current Windows shared UI and instruction contracts.
 * These protected fragments are pinned to 560c7403e6891ef35a1343e3ea29fc389c20ab53.
 * Run: node tests/windows-teaching-preservation.test.cjs [--source <vault>]
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const at = process.argv.indexOf('--source');
const source = at < 0 ? path.resolve(__dirname,'..') : path.resolve(process.argv[at+1]);
const manifest = require('./fixtures/windows-teaching-protected.json');
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
for (const [file, expected] of Object.entries(manifest)) {
  const html = fs.readFileSync(path.join(source,file),'utf8');
  assert.deepEqual([...html.matchAll(/<(?:link|script)\b[^>]*(?:src|href)="\.\.\/visualizer-ui\/[^\"]+"[^>]*>/g)].map(m=>m[0]),expected.sharedAssets, file+' shared links');
  assert.equal(hash([...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]).join('\n')),expected.styleHash,file+' CSS');
  assert.equal(hash([...html.matchAll(/<div id="line-\d+"[^\n]+/g)].map(m=>m[0]).join('\n')),expected.referenceCodeHash,file+' reference source');
  let bridge = html.match(/\/\/ STUDY LESSON BRIDGE START[\s\S]*?\/\/ STUDY LESSON BRIDGE END/)[0];
  if (file.includes('serialize_and_deserialize')) {
    // The existing hooks are retained. Only read/readAt gain source-owned partial
    // objectLocals, consumed by the existing shared Object View adapter.
    assert.match(bridge,/\.\.\.codecObjectLocals\(steps\[stepIndex\]\)/);
    assert.match(bridge,/\.\.\.codecObjectLocals\(steps\[studySnapshotIndex\]\)/);
    bridge=bridge.replace(/, \.\.\.codecObjectLocals\(steps\[(?:stepIndex|studySnapshotIndex)\]\)/g,'');
  }
  assert.equal(hash(bridge),expected.bridgeHash,file+' Guided/history/Object View bridge');
  for (const [name,end,key] of [['pendingInstruction()','    // Boot','pendingInstructionHash'],['prepareInstructionSteps(frames)','    function buildSteps(','prepareInstructionStepsHash']]) if (expected[key]) {
    const start=html.indexOf('function '+name);
    assert.equal(hash(html.slice(start,html.indexOf(end,start))),expected[key],file+' '+name);
  }
  assert.doesNotMatch(html,/^(?:<<<<<<<|=======|>>>>>>>) /m);
  console.log('PASS protected Windows integration: '+file);
}
console.log('9 pages retain pinned shared assets, CSS, reference code, instruction metadata helpers and lesson hooks.');
