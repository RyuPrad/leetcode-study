import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './content.mjs';
export function checkOperations(){
 const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json'),'utf8'));
 const operations=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/operations.json'),'utf8'));
 if(operations.length!==250||new Set(operations.map(o=>o.id)).size!==250)throw Error('Operation rules must cover all 250 lessons.');
 for(const lesson of lessons){const item=operations.find(o=>o.id===lesson.id);if(!item||item.mode!==lesson.mode||!Object.keys(item.lines).length)throw Error(`Missing operation rules: ${lesson.id}`);for(const [line,rule]of Object.entries(item.lines))if(!Number.isInteger(Number(line))||!rule.kind||!rule.code||!rule.focus||!rule.action)throw Error(`Invalid operation: ${lesson.id}:${line}`);}
 return operations;
}
export function buildOperations(){const operations=checkOperations();fs.writeFileSync(path.join(ROOT,'visualizer-ui/operation-rules.js'),`/* Generated from reviewed reference operation rules. */\nwindow.studyOperationRules=${JSON.stringify(operations)};\n`);return operations.length;}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(ROOT,'scripts/check-operations.mjs'))console.log(`Validated ${process.argv.includes('--build')?buildOperations():checkOperations().length} operation sets.`);
