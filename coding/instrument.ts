import { parse } from '@babel/parser';
import traverseImport, { type NodePath } from '@babel/traverse';
import generateImport from '@babel/generator';
import * as t from '@babel/types';
const traverse = (traverseImport as any).default || traverseImport;
const generate = (generateImport as any).default || generateImport;
export interface DebugSite { line: number; column: number; endLine: number; endColumn: number; kind: string; text: string; name?: string; }
export function instrument(source: string) {
  const ast=parse(source,{sourceType:'script'}), sites: DebugSite[]=[], lines=new Set<number>();
  let helper=t.identifier('_studyDebug'),nodeCount=0,capturedBindings=0;
  const fail=(path:NodePath,message:string):never=>{throw new Error(`Debugging unavailable at line ${path.node.loc?.start.line || 1}: ${message}`);};
  traverse(ast,{
    enter(path:NodePath){if(++nodeCount>40000)fail(path,'This program is too large to instrument. Use a smaller solution or Run / Submit.');},
    Program(path:NodePath<t.Program>){helper=path.scope.generateUidIdentifier('studyDebug');},
    Function(path:NodePath<t.Function>){if(path.node.async||path.node.generator)fail(path,'Use synchronous functions for live debugging.');},
    WithStatement(path:NodePath){fail(path,'with statements cannot be debugged.');},
    ReferencedIdentifier(path:NodePath<t.Identifier>){if(['eval','Function','Proxy','Promise'].includes(path.node.name)&&!path.scope.getBinding(path.node.name))fail(path,`${path.node.name} is not supported by live debugging. Run and Submit are still available.`);},
    MemberExpression(path:NodePath<t.MemberExpression>){const key=path.node.computed&&t.isStringLiteral(path.node.property)?path.node.property.value:!path.node.computed&&t.isIdentifier(path.node.property)?path.node.property.name:'';if(['eval','Function','Proxy'].includes(key))fail(path,`${key} is not supported by live debugging.`);},
    ArrowFunctionExpression(path:NodePath<t.ArrowFunctionExpression>){if(!t.isBlockStatement(path.node.body)){const ret=t.returnStatement(path.node.body);ret.loc=path.node.body.loc;path.node.body=t.blockStatement([ret]);}},
  });
  traverse(ast,{Program(path:NodePath<t.Program>){path.scope.crawl();}});
  const call=(method:string,args:t.Expression[])=>t.callExpression(t.memberExpression(t.cloneNode(helper),t.identifier(method)),args);
  function site(path:NodePath,kind:string,name?:string){const loc=path.node.loc;const index=sites.length;sites.push({line:loc?.start.line||1,column:(loc?.start.column||0)+1,endLine:loc?.end.line||1,endColumn:(loc?.end.column||0)+1,kind,text:source.slice(path.node.start??0,path.node.end??0).split('\n')[0].slice(0,180),...(name?{name}:{})});if(kind!=='function')lines.add(loc?.start.line||1);return t.numericLiteral(index);}
  function environment(path:NodePath){
    const bindings=Object.entries(path.scope.getAllBindings());capturedBindings+=bindings.length;
    if(capturedBindings>20000)fail(path,'This program has too many scope captures for live debugging. Split it into smaller functions or use Run / Submit.');
    const entries=bindings.map(([name,binding]:[string,any])=>t.arrayExpression([t.stringLiteral(`${binding.identifier.start??0}:${name}`),t.stringLiteral(name),t.stringLiteral(binding.scope.path.isProgram()?'Global':binding.scope.getFunctionParent()===path.scope.getFunctionParent()?'Local':'Closure'),t.arrowFunctionExpression([],t.identifier(name))]));
    if(path.getFunctionParent())entries.push(t.arrayExpression([t.stringLiteral('this'),t.stringLiteral('this'),t.stringLiteral('Local'),t.arrowFunctionExpression([],t.thisExpression())]));
    return t.arrayExpression(entries);
  }
  function writeTarget(path:NodePath){
    let target=path;
    while(target.parentPath&&(target.parentPath.isArrayPattern()||target.parentPath.isObjectPattern()||target.parentPath.isRestElement()||target.parentPath.isObjectProperty()&&target.key==='value'||target.parentPath.isAssignmentPattern()&&target.key==='left'))target=target.parentPath;
    const parent=target.parentPath;
    return parent?.isAssignmentExpression()&&target.key==='left'||parent?.isUpdateExpression()||parent?.isForInStatement()&&target.key==='left'||parent?.isForOfStatement()&&target.key==='left';
  }
  const functions:{path:NodePath<any>;id:t.NumericLiteral;token:t.Identifier}[]=[], statements:{path:NodePath<any>;id:t.NumericLiteral;env:t.ArrayExpression}[]=[], conditions:{path:NodePath<any>;id:t.NumericLiteral;env:t.ArrayExpression}[]=[], iterations:{path:NodePath<any>;id:t.NumericLiteral;env:t.ArrayExpression}[]=[], returns:{path:NodePath<t.ReturnStatement>;id:t.NumericLiteral;env:t.ArrayExpression}[]=[], reads:{path:NodePath<t.MemberExpression>;id:t.NumericLiteral}[]=[], calls:NodePath<t.CallExpression>[]=[];
  traverse(ast,{
    Function(path:NodePath<any>){const parent=path.parent;const name=path.node.id?.name || (t.isVariableDeclarator(parent)&&t.isIdentifier(parent.id)?parent.id.name:t.isIdentifier(path.node.key)?path.node.key.name:'callback');functions.push({path,id:site(path,'function',name),token:path.scope.generateUidIdentifier('frame')});},
    Statement(path:NodePath<any>){
      if(!path.node.loc||path.isBlockStatement()||path.isEmptyStatement()||path.isFunctionDeclaration()||path.isLabeledStatement())return;
      if(path.parentPath?.isForStatement()&&path.key==='init'||(path.parentPath?.isForInStatement()||path.parentPath?.isForOfStatement())&&path.key==='left'||path.parentPath?.isLabeledStatement())return;
      statements.push({path,id:site(path,'before'),env:environment(path)});
    },
    'IfStatement|WhileStatement|DoWhileStatement|ForStatement'(path:NodePath<any>){conditions.push({path,id:site(path,'condition'),env:environment(path)});},
    'ForOfStatement|ForInStatement'(path:NodePath<any>){iterations.push({path,id:site(path,'iteration'),env:environment(path.get('body') as NodePath)});},
    ReturnStatement(path:NodePath<t.ReturnStatement>){returns.push({path,id:site(path,'return'),env:environment(path)});},
    MemberExpression(path:NodePath<t.MemberExpression>){const p=path.parentPath;if(t.isSuper(path.node.object)||t.isPrivateName(path.node.property)||writeTarget(path)||p.isUnaryExpression({operator:'delete'})||p.isCallExpression()&&path.key==='callee'||p.isOptionalCallExpression()&&path.key==='callee'||p.isNewExpression()&&path.key==='callee'||p.isTaggedTemplateExpression())return;reads.push({path,id:site(path,'read')});},
    CallExpression(path:NodePath<t.CallExpression>){const callee=path.node.callee;if(t.isMemberExpression(callee)&&!t.isSuper(callee.object)&&!t.isPrivateName(callee.property))calls.push(path);},
  });
  // Work from children to parents; generated helper calls are never traversed.
  for(const {path,id} of reads.reverse())if(!path.removed)path.replaceWith(call('read',[id,path.node.object as t.Expression,path.node.computed?path.node.property as t.Expression:t.stringLiteral((path.node.property as t.Identifier).name)]));
  for(const path of calls.reverse())if(!path.removed){const callee=path.node.callee as t.MemberExpression;path.replaceWith(call('invoke',[site(path,'call'),callee.object as t.Expression,callee.computed?callee.property as t.Expression:t.stringLiteral((callee.property as t.Identifier).name),t.arrowFunctionExpression([],t.arrayExpression(path.node.arguments as (t.Expression|t.SpreadElement)[]))]));}
  for(const {path,id,env} of returns)path.node.argument=call('returnValue',[id,path.node.argument||t.unaryExpression('void',t.numericLiteral(0)),t.arrowFunctionExpression([],env)]);
  for(const {path,id,env} of conditions)path.node.test=call('condition',[id,path.node.test||t.booleanLiteral(true),t.arrowFunctionExpression([],env)]);
  for(const {path,id,env} of iterations){const body=path.node.body;if(!t.isBlockStatement(body))path.node.body=t.blockStatement([body]);path.node.body.body.unshift(t.expressionStatement(call('step',[id,t.arrowFunctionExpression([],env)])));}
  for(const {path,id,env} of statements.reverse())if(!path.removed)path.insertBefore(t.expressionStatement(call('step',[id,t.arrowFunctionExpression([],env)])));
  for(const {path,id,token} of functions.reverse()){
    const body=path.node.body as t.BlockStatement;
    body.body=[t.variableDeclaration('const',[t.variableDeclarator(token,call('enter',[id]))]),t.tryStatement(t.blockStatement(body.body),null,t.blockStatement([t.expressionStatement(call('leave',[token]))]))];
  }
  const output=generate(ast,{sourceMaps:true,sourceFileName:'solution.js',retainLines:true},source);
  return {code:output.code,helperName:helper.name,sites,executableLines:[...new Set(sites.filter(s=>['before','iteration','condition'].includes(s.kind)).map(s=>s.line))].sort((a,b)=>a-b),map:output.map};
}
