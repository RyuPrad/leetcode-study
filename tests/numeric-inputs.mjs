import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import{pathToFileURL}from'node:url';import{chromium}from'playwright';import{ROOT}from'../scripts/content.mjs';
const lessons=JSON.parse(fs.readFileSync(path.join(ROOT,'visualizer-ui/lessons.json')));
const cases=[
 [1095,['[1,3,5,4,2] | 4','1,3,5,4,2 | 1'],['1,bad,5,4,2 | 4','[1,null,5,4,2] | 4','[1,true,5,4,2] | 4','[1,3,5 | 4','1,3,3,2 | 3','1,2 | 2','1,3,2 | 1.5','1,3,2 |','1,3,2 | 1 | 2']],
 [4,['[1,3] | [2]','| 1,2'],['1,bad,3 | 2','[1,null,3] | 2','[1,"2",3] | 2','1,,3 | 2','3,1 | 2','|','1,2 | 2.5','1,2 | 3 | 4']],
 [42,['0,1,0,2','[0,1,0,2]','[]'],['0,bad,2','0,,2','[0,null,2]','[0,true,2]','[0,"1",2]','[0,1','-1,2','1.5,2','1,Infinity']],
 [189,['1,2,3 | 2','-1,2,3'],['1,bad,3 | 2','1,,3 | 2','1,2 | 1.5','1,2 | -1','1,2 |','1,2 | 2 | 3','| 2']],
 [502,['2 | 0 | 1,2,3 | 0,1,1','0 | 0 | |'],['2 | 0 | 1,bad,3 | 0,1,1','2 | 0 | 1,,3 | 0,1,1','1.5 | 0 | 1 | 0','1 | -1 | 1 | 0','1 | 0 | -1 | 0','1 | 0 | 1 | -1','1 | 0 | 1,2 | 0','1 | 0 | 1 | 0 | 1','1 | 1 | 9007199254740991 | 0']],
 [11,['[1,2,3]','1,2,3'],['1,bad,2','1,,2','[1,null,2]','[1,true,2]','[1,"2",3]','[1,2','[-1,2]','[1]','1.5,2','1,Infinity']],
 [74,['1,1,3;5,6,7 | 6','1,2;3,4 | -1'],['1,bad;3,4 | 3','1,2;3 | 3','2,1;3,4 | 3','1,2;2,3 | 2','1,2;0,3 | 3','1,2;3,4 | 1.5','1,,2 | 1','| 1','1,2 | null']],
 [875,['[3,6,7,11] | 8','3,6,7,11'],['3,bad,7 | 8','[3,null,7] | 8','[3,true,7] | 8','0,3 | 8','3,6 | 1','3,6 | 2.5','3,6 | Infinity','3,6 |','3,6 | 8 | 9']],
 [1011,['[1,2,3] | 2','1,2,3'],['1,bad,3 | 2','[1,"2",3] | 2','0,2 | 1','1,2 | 0','1,2 | 3','1,2 | 1.5','1,2 |','1,2 | 2 | 3']],
 [410,['[7,2,5,10,8] | 2','0,0 | 1'],['1,bad,3 | 2','[1,null,3] | 2','-1,2 | 1','1,2 | 0','1,2 | 3','1,2 | 1.5','1,2 |','1,,2 | 1']],
 [219,['1,2,3,1 | 3','| 0','1,2,3'],['1,bad,3 | 2','1,,3 | 2','1,2 | 1.5','1,2 | -1','1,2 | Infinity','1,2 |','1,2 | 2 | 3']],
 [19,['1,2,3,4,5 | 2','1 | 1'],['1,bad,3 | 2','1,,3 | 2','1,2,3 | 1.5','1,2 | 0','1,2 | 3','| 1','1,2 |','1,2 | 1 | 2']],
 [209,['7 | 1,2,3,4','7 |'],['7 | 1,bad,3','7 | 1,,3','0 | 1,2,3','-1 | 1,2','7 | 1,-1,7','7 | 1,0,7','1.5 | 1,2','7 | 1,2 | 3']],
 [881,['1 | 3','1,2 | 3'],['1,bad | 3','1,,2 | 3','0,1 | 3','10 | 3','1,2 | 2.5','1,2 |','| 3','1,2 | 3 | 4']],
 [33,['[5,1,3] | 5','5,1,3'],['5,bad,3 | 5','[5,true,3] | 5','5,,3 | 5','5,1,3 |','5,1,3 | 1.5']],
 [81,['[1,1,3,1] | 3','1,1,3,1'],['1,bad,3 | 3','[1,null,3] | 3','1,,3 | 3','1,1,3 |','1,1,3 | 1.5']],
 [88,['1,3,0,0 | 2 | 2,4 | 2','| 0 | | 0'],['1,bad,0 | 2 | 3 | 1','1,2,0 | 1.5 | 3 | 1.5','1,2,0 | -1 | 3 | 4','2,1,0 | 2 | 3 | 1','1,2,0 | 2 | 3 | 2','1,,0 | 2 | 3 | 1']],
 [658,['1,2,3 | 2 | 2'],['1,bad,3 | 2 | 2','1,2,3 | 1.5 | 2','3,2,1 | 2 | 2','1,2 | 3 | 2','1,2 | 1 | 2 | 3']],
 [374,['10 | 6'],['10 | 6 | 7','10 | 6.5','| 1','10 | 11']],
];
const browser=await chromium.launch(),page=await browser.newPage();let accepted=0,rejected=0;
try{for(const[number,valid,invalid]of cases){await page.goto(pathToFileURL(path.join(ROOT,lessons.find(l=>l.number===number).path)).href);await page.waitForFunction(()=>window.studyLessonAdapter);
 for(const input of valid){const result=await page.evaluate(input=>{window.alert=()=>{};document.getElementById('custom-input').value=input;if(document.getElementById('target-input'))document.getElementById('target-input').value=studyLessonSource.spec.number===875?'8':studyLessonSource.spec.number===1011?'2':'3';return loadCustom();},input);assert.equal(result,true,`${number}: accepted format ${input}`);accepted++;}
 const outcomes=await page.evaluate(inputs=>{window.alert=()=>{};for(let i=0;i<5&&!document.getElementById('btn-next').disabled;i++){const instruction=studyLessonSource.pendingInstruction?.();if(!instruction&&!Number.isInteger(studyLessonSource.readAt?.(studyLessonSource.index()+1).executedLine))break;studyLessonAdapter.next();}studyWalkthrough.setMode('detailed');
 const observe=()=>JSON.stringify({raw:studyLessonSource.read(),index:studyLessonSource.index(),transition:studyLessonAdapter.currentTransition(),operation:studyWalkthrough.operation,mode:studyWalkthrough.mode,timeline:document.querySelector('.study-timeline').outerHTML,range:document.querySelector('.study-timeline input')?.value,card:document.querySelector('.operation-card')?.outerHTML});
 return inputs.map(input=>{const before=observe();document.getElementById('custom-input').value=input;const returned=loadCustom();return{input,returned,same:before===observe()};});},invalid);
 for(const result of outcomes){assert.equal(result.returned,false,`${number}: rejected ${result.input}`);assert.equal(result.same,true,`${number}: rejection preserves raw/journal/operation/mode/timeline for ${result.input}`);rejected++;}
 }
 console.log(`Validated ${accepted} accepted numeric formats and ${rejected} atomic rejections across ${cases.length} visualizers.`);
}finally{await browser.close();}
