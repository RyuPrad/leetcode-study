import test from 'node:test';
import assert from 'node:assert/strict';
import {collectTabOutTargets,tabOutTarget,type CodeToken} from '../src/coding/tab-out-targets';

// Token spans exercise navigation independently; the browser suite uses the real JS lexer.
function spans(text:string,regions:Array<[string,string]>):CodeToken[]{
  const result:CodeToken[]=[{offset:0,type:'delimiter.js'}];let from=0;
  for(const [value,type] of regions){const offset=text.indexOf(value,from);assert.ok(offset>=0);result.push({offset,type},{offset:offset+value.length,type:'delimiter.js'});from=offset+value.length;}
  return result.sort((a,b)=>a.offset-b.offset);
}
test('TabOut moves through nested boundaries in UTF-16 positions without editing code',()=>{
  const source='call(["😀", value])',line=collectTabOutTargets(source,[spans(source,[[ '"😀"','string.js']])])[0];
  const first=tabOutTarget(line,source.indexOf('value'),'forward');assert.equal(first,source.indexOf(']')+1);
  assert.equal(tabOutTarget(line,first!,'forward'),source.length);
  assert.equal(tabOutTarget(line,source.length,'backward'),source.indexOf(')'));
  assert.equal(tabOutTarget(line,source.indexOf('"')+1,'forward'),source.lastIndexOf('"')+1);
  assert.equal(line.text,source);
});
test('TabOut ignores escaped quotes and bracket characters inside strings',()=>{
  const literal='"a\\\"[)]b"',source=`log(${literal})`,line=collectTabOutTargets(source,[spans(source,[[literal,'string.js']])])[0];
  assert.equal(tabOutTarget(line,source.indexOf('a'),'forward'),source.lastIndexOf('"')+1);
  assert.equal(tabOutTarget(line,source.lastIndexOf('"'),'backward'),source.indexOf('"'));
});
test('TabOut skips comments and regex punctuation and preserves indentation within them',()=>{
  const source='call(/* [" */ /[)]/, value)',line=collectTabOutTargets(source,[spans(source,[['/* [" */','comment.js'],['/[)]/','regexp.js']])])[0];
  assert.equal(tabOutTarget(line,source.indexOf('value'),'forward'),source.length);
  assert.equal(tabOutTarget(line,source.indexOf('"'),'forward'),null);
  assert.equal(tabOutTarget(line,source.indexOf(']'),'backward'),null);
  const comment='// ignore )',other=collectTabOutTargets(comment,[[{offset:0,type:'comment.js'}]])[0];
  assert.equal(tabOutTarget(other,comment.length,'backward'),null);
});
test('TabOut follows nested template expressions and multiline template quotes',()=>{
  const source='fn(`a${go("x")}b`)',line=collectTabOutTargets(source,[spans(source,[['`a','string.js'],['"x"','string.js'],['b`','string.js']])])[0];
  assert.deepEqual(line.forward,[source.indexOf('"x"')+3,source.indexOf(')')+1,source.indexOf('}')+1,source.lastIndexOf('`')+1,source.length]);
  const lines=collectTabOutTargets('fn(`one\ntwo`)',[[{offset:0,type:'delimiter.js'},{offset:3,type:'string.js'}],[{offset:0,type:'string.js'},{offset:4,type:'delimiter.js'}]]);
  assert.equal(tabOutTarget(lines[0],5,'forward'),null);
  assert.equal(tabOutTarget(lines[1],1,'forward'),4);
});
test('TabOut leaves leading whitespace, missing boundaries and unfinished strings to native Tab',()=>{
  const source='  fn(value',line=collectTabOutTargets(source,[[{offset:0,type:'delimiter.js'}]])[0];
  assert.equal(tabOutTarget(line,2,'forward'),null);assert.equal(tabOutTarget(line,source.length,'forward'),null);
  const lines=collectTabOutTargets('"unfinished )\nfn(value)',[[{offset:0,type:'string.invalid.js'}],[{offset:0,type:'delimiter.js'}]]);
  assert.equal(tabOutTarget(lines[0],3,'forward'),null);assert.equal(tabOutTarget(lines[1],4,'forward'),9);
  const untokenized=collectTabOutTargets('fn("not classified )")',[[{offset:0,type:''}]])[0];
  assert.equal(tabOutTarget(untokenized,5,'forward'),null);
});
