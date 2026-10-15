// Authoring aid for problems added after the original library: writes a reference visualizer
// page from a page module and the problem's JavaScript reference in coding/problems.json.
// The written HTML is the maintained source afterwards; edit it directly for later changes.
//   node scripts/new-visualizer.mjs <page-module.mjs> [...more]
// A page module default-exports { number, topic, file, heading, examples: [[label, input]],
// customLabel, script }, or is a problem module with these fields under `page`, where script defines the page's examples, steps, stepIndex, init,
// nextStep, prevStep, loadExample, loadCustom, render and window.studyLessonSource.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './content.mjs';

const KEYWORDS = new Set(['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'of', 'in', 'new', 'class', 'this', 'null', 'true', 'false', 'undefined', 'break', 'continue', 'typeof', 'constructor', 'static', 'switch', 'case', 'default', 'throw', 'try', 'catch', 'Infinity']);
const esc = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Highlighted code rows, one div per source line, numbered from 1. */
export function codeRows(code) {
  return code.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n').map((line, index) => {
    let html = '';
    // Numbers may carry a BigInt n suffix; the last alternative keeps any other character as text.
    const pattern = /(\/\/.*$)|('(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`(?:\\.|[^`])*`)|(\b\d+(?:\.\d+)?n?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|([^A-Za-z_$\d'"`/]+|\/)|([\s\S])/g;
    for (const match of line.matchAll(pattern)) {
      const [text, comment, string, number, call, word] = match;
      if (comment) html += `<span class="cm">${esc(comment)}</span>`;
      else if (string) html += `<span class="str">${esc(string)}</span>`;
      else if (number) html += `<span class="num">${number}</span>`;
      else if (call) html += KEYWORDS.has(call) ? `<span class="kw">${call}</span>` : `<span class="fn">${call}</span>`;
      else if (word) html += KEYWORDS.has(word) ? `<span class="kw">${word}</span>` : word;
      else html += esc(text);
    }
    return `<div id="line-${index + 1}" class="code-line">${html}</div>`;
  }).join('\n');
}

// The stepping controls and lesson bridge every kit page shares. A page module that sets `frame`
// (the Object View frame name) and omits its own bridge gets these appended to its script;
// `frameOptions` is source text for StudyKit.objectFrame's options, e.g. a scope labeller.
export const standardTail = (frame, options = '') => String.raw`
function init(){buildSteps();stepIndex=0;render();}
function nextStep(){if(stepIndex<steps.length-1){stepIndex++;render();}}
function prevStep(){if(stepIndex>0){stepIndex--;render();}}
init();
// STUDY LESSON BRIDGE START
window.studyLessonSource = {
  spec: {},
  index:()=>stepIndex,count:()=>steps.length,read:()=>steps[stepIndex],readAt:index=>steps[index],
  phases:()=>steps.map((state,index)=>({index,phase:state.phase})),
  jump:index=>{stepIndex=Math.max(0,Math.min(steps.length-1,index));render();},
  objectFrame(index=stepIndex){return StudyKit.objectFrame(steps[index],${JSON.stringify(frame)}${options ? ',' + options : ''});}
};
// STUDY LESSON BRIDGE END`;

export function page(spec, reference) {
  if (spec.frame && !spec.script.includes('STUDY LESSON BRIDGE')) spec = { ...spec, script: spec.script.replace(/\s+$/, '') + '\n' + standardTail(spec.frame, spec.frameOptions) };
  const examples = spec.examples.map(([label], i) => `<button id="btn-ex-${i + 1}" onclick="loadExample(${i + 1})">${esc(label)}</button>`).join('');
  const first = spec.examples[0][1];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leetcode ${spec.number}. ${esc(spec.title)} Visualizer</title>
  <style>
    :root { color-scheme:dark; font-family:system-ui,sans-serif; background:#1e1e1e; color:#d4d4d4; }
    body { margin:0; padding:24px; } button,input { font:inherit; } button { cursor:pointer; }
    .panel { background:#252526; border:1px solid #3c3c3c; border-radius:8px; padding:16px; } h2 { font-size:16px; }
    .layout { display:grid; grid-template-columns:1fr 1fr; gap:16px; } .code-line { white-space:pre; font:14px/1.7 Consolas,monospace; padding:0 8px; }
    .code-line.active { background:#34312a; border-left:3px solid #d7ba7d; } .kw { color:#c586c0; } .fn { color:#dcdcaa; } .num { color:#b5cea8; } .str { color:#ce9178; } .cm { color:#6a9955; }
    .console { white-space:pre-wrap; font:13px/1.7 Consolas,monospace; } .result-value { color:#b5cea8; }
    #drag-container > div { display:flex; flex-wrap:wrap; gap:8px; margin:8px 0; } #custom-input { min-width:310px; }${spec.style ? '\n    ' + spec.style.trim() : ''}
  </style>
  <link rel="stylesheet" href="../visualizer-ui/reference-kit.css" />
  <script src="../visualizer-ui/reference-kit.js"></script>
  <link rel="stylesheet" href="../visualizer-ui/workspace.css" />
  <link rel="stylesheet" href="../visualizer-ui/panel-layout.css" />
  <script defer src="../visualizer-ui/panel-layout.js"></script>
  <script defer src="../visualizer-ui/workspace.js"></script>
  <link rel="stylesheet" href="../visualizer-ui/learning.css" />
  <link rel="stylesheet" href="../visualizer-ui/object-view.css" />
  <script defer src="../visualizer-ui/object-view.js"></script>
  <script defer src="../visualizer-ui/object-state.js"></script>
  <script defer src="../visualizer-ui/operation-rules.js"></script>
  <script defer src="../visualizer-ui/operations.js"></script>
  <script defer src="../visualizer-ui/learning.js"></script>
  <script defer src="../visualizer-ui/guided-core.js"></script>
  <script defer src="../visualizer-ui/guided.js"></script>
  <link rel="stylesheet" href="../visualizer-ui/code-language.css" />
  <script defer src="../visualizer-ui/code-languages.js"></script>
  <script defer src="../visualizer-ui/code-language.js"></script>
</head>
<body>
  <h1 class="page-title">${spec.number}. ${esc(spec.title)}</h1>
  <div id="drag-container">
    <div><button id="btn-prev" onclick="prevStep()">Back</button><button id="btn-next" onclick="nextStep()">Step Over</button><button id="btn-reset" onclick="init()">Reset</button><button id="btn-fullscreen" onclick="document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()">Fullscreen</button></div>
    <div>${examples}</div>
    <div><label for="custom-input">${esc(spec.customLabel)}</label><input id="custom-input" value="${esc(first).replace(/"/g, '&quot;')}" /><button onclick="loadCustom()">Load</button></div>
  </div>
  <div class="layout">
    <div class="panel"><h2>${esc(spec.heading)}</h2><div id="narration-ui"></div><div id="visual-ui"></div><div id="final-ui" class="result-value"></div></div>
    <div class="panel code-panel"><h2>Live Debugger</h2><div id="reference-code">
${codeRows(reference)}
    </div></div>
    <div class="panel"><h2>Object View — nested JS object format (debugger-style)</h2><div id="object-view"></div></div>
    <div class="panel"><h2>Variables & Outputs</h2><div id="console-ui" class="console"></div></div>
    <div class="panel"><h2>Operation Trace</h2><div id="trace-ui"></div></div>
  </div>
  <script>
${spec.script.replace(/^\n+|\s+$/g, '').split('\n').map(line => line ? '    ' + line : line).join('\n')}
  </script>
</body>
</html>
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  const problems = JSON.parse(fs.readFileSync(path.join(ROOT, 'coding/problems.json'), 'utf8'));
  for (const file of process.argv.slice(2)) {
    const module = (await import(pathToFileURL(path.resolve(file)).href)).default;
    // A problem module (see new-problem.mjs) carries its page under `page`.
    const spec = module.page ? { number: module.number, topic: module.topic, title: module.title, file: module.visualizer, ...module.page } : module;
    const problem = problems.find(p => p.number === spec.number);
    if (!problem) throw Error(`Add problem ${spec.number} to coding/problems.json first.`);
    const out = path.join(ROOT, spec.topic, spec.file);
    // The page shows the module's own reference; judge-only helpers stay out of the code panel.
    fs.writeFileSync(out, page({ ...spec, title: spec.title || problem.title }, module.page && module.reference ? module.reference.trim() : problem.reference));
    console.log(`Wrote ${path.relative(ROOT, out)}`);
  }
}
