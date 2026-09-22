import { useEffect, useLayoutEffect, useRef } from 'react';
import type { VisualLocation } from '../../shared/visualization';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import {installTabOut} from './tab-out';
import type {EditorFocusRequest} from './editor-focus';
// Register services before the first editor; TypeScript loads further contributions lazily.
import 'monaco-editor/editor/contrib/codelens/browser/codeLensCache.js';
import 'monaco-editor/editor/common/services/treeViewsDndService.js';
import 'monaco-editor/editor/contrib/clipboard/browser/clipboard.js';
import 'monaco-editor/editor/contrib/find/browser/findController.js';
import 'monaco-editor/editor/contrib/suggest/browser/suggestController.js';
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution.js';
import 'monaco-editor/editor/contrib/folding/browser/folding.js';
import 'monaco-editor/editor/contrib/format/browser/formatActions.js';
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js';
import 'monaco-editor/editor/contrib/linesOperations/browser/linesOperations.js';
import 'monaco-editor/editor/contrib/parameterHints/browser/parameterHints.js';
import 'monaco-editor/editor/contrib/contextmenu/browser/contextmenu.js';
import 'monaco-editor/editor/contrib/snippet/browser/snippetController2.js';
import 'monaco-editor/editor/contrib/wordOperations/browser/wordOperations.js';
import 'monaco-editor/editor/contrib/tokenization/browser/tokenization.js';
import * as typescript from 'monaco-editor/languages/features/typescript/register.js';
import 'monaco-editor/languages/definitions/javascript/register.js';
import {language as javascriptTokens} from 'monaco-editor/languages/definitions/javascript/javascript.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import TypeScriptWorker from 'monaco-editor/language/typescript/ts.worker.js?worker';
(self as any).MonacoEnvironment={getWorker:(_id: string,label: string)=>label==='typescript'||label==='javascript'?new TypeScriptWorker():new EditorWorker()};
// Load the existing lexer synchronously so navigation also works on the first keypress.
monaco.languages.setMonarchTokensProvider('javascript',javascriptTokens);
typescript.javascriptDefaults.setDiagnosticsOptions({noSemanticValidation:true,noSyntaxValidation:false});
typescript.javascriptDefaults.setCompilerOptions({target:typescript.ScriptTarget.ESNext,allowNonTsExtensions:true,allowJs:true,checkJs:false});
typescript.javascriptDefaults.addExtraLib('declare class ListNode { val: number; next: ListNode | null; constructor(val?: number, next?: ListNode | null); }\ndeclare class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null); }\ndeclare function guess(n: number): number;\ndeclare class Node { val: any; next: Node | null; random: Node | null; neighbors: Node[]; isLeaf: boolean; topLeft: Node | null; topRight: Node | null; bottomLeft: Node | null; bottomRight: Node | null; constructor(val?: any, second?: any, topLeft?: any, topRight?: any, bottomLeft?: any, bottomRight?: any); }','study-structures.d.ts');
monaco.editor.defineTheme('study',{base:'vs-dark',inherit:true,rules:[],colors:{'editor.background':'#101722','editor.lineHighlightBackground':'#172235','editorLineNumber.foreground':'#536783','editorCursor.foreground':'#a3c3ff','editor.selectionBackground':'#30496b'}});
export default function CodeEditor({source,onChange,problemId,active,line,focusRequest=null,readOnly=false,tabOutEnabled=false,traceLocation=null,breakpoints=[],executableLines=[],onBreakpointsChange}:{source:string;onChange:(value:string)=>void;problemId:string;active:boolean;line:number|null;focusRequest?:EditorFocusRequest|null;readOnly?:boolean;tabOutEnabled?:boolean;traceLocation?:VisualLocation|null;breakpoints?:number[];executableLines?:number[];onBreakpointsChange?:(lines:number[])=>void}) {
  const host=useRef<HTMLDivElement>(null), editor=useRef<monaco.editor.IStandaloneCodeEditor|null>(null), change=useRef(onChange);
  change.current=onChange;
  const debugRef=useRef({breakpoints,onBreakpointsChange});debugRef.current={breakpoints,onBreakpointsChange};
  const markers=useRef<monaco.editor.IEditorDecorationsCollection|null>(null),trace=useRef<monaco.editor.IEditorDecorationsCollection|null>(null);
  const tabOut=useRef<ReturnType<typeof installTabOut>|null>(null);
  const savedView=useRef<monaco.editor.ICodeEditorViewState|null>(null);
  useLayoutEffect(()=>{
    savedView.current=null;
    const model=monaco.editor.createModel(source,'javascript',monaco.Uri.parse(`study://solution/${problemId.replace(':','-')}.js`));
    const instance=monaco.editor.create(host.current!,{model,theme:'study',automaticLayout:true,minimap:{enabled:false},fontSize:13,fontFamily:'Consolas, monospace',lineNumbersMinChars:3,scrollBeyondLastLine:false,padding:{top:16,bottom:16},tabSize:2,insertSpaces:true,wordWrap:'on',ariaLabel:readOnly?'Debug source':'JavaScript solution',accessibilitySupport:'auto',fixedOverflowWidgets:true,readOnly,glyphMargin:!!onBreakpointsChange});
    editor.current=instance;
    tabOut.current=installTabOut(instance,tabOutEnabled&&!readOnly);
    const listener=model.onDidChangeContent(()=>change.current(model.getValue()));
    markers.current=instance.createDecorationsCollection();trace.current=instance.createDecorationsCollection();
    const toggle=(lineNumber:number)=>{const state=debugRef.current;state.onBreakpointsChange?.(state.breakpoints.includes(lineNumber)?state.breakpoints.filter(n=>n!==lineNumber):[...state.breakpoints,lineNumber].sort((a,b)=>a-b));};
    const mouse=instance.onMouseDown(event=>{if(event.target.type===monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN&&event.target.position)toggle(event.target.position.lineNumber);});
    const key=instance.onKeyDown(event=>{if(event.keyCode===monaco.KeyCode.F9&&debugRef.current.onBreakpointsChange){event.preventDefault();toggle(instance.getPosition()?.lineNumber||1);}});
    return ()=>{listener.dispose();mouse.dispose();key.dispose();tabOut.current?.dispose();tabOut.current=null;instance.dispose();model.dispose();editor.current=null;};
  },[problemId]);
  useLayoutEffect(()=>{const model=editor.current?.getModel();if(model&&model.getValue()!==source){savedView.current=null;model.setValue(source);}},[source]);
  useLayoutEffect(()=>{
    const instance=editor.current;
    if(!active||readOnly)focusRequest?.cancel();
    if(!active||!instance)return;
    const frame=requestAnimationFrame(()=>{
      instance.layout();
      if(!readOnly&&savedView.current){instance.restoreViewState(savedView.current);savedView.current=null;}
      if(focusRequest&&!focusRequest.signal.aborted){
        focusRequest.cancel();
        if(document.hasFocus()&&!document.querySelector('dialog[open]')&&host.current?.getClientRects().length)instance.focus();
      }
    });
    return()=>{
      cancelAnimationFrame(frame);
      // Monaco retains the model/undo stack; snapshot the view before hidden layout.
      if(!readOnly&&editor.current===instance)savedView.current=instance.saveViewState();
    };
  },[active,focusRequest,problemId,readOnly]);
  useEffect(()=>{if(line&&active&&editor.current){savedView.current=null;editor.current.revealLineInCenter(line);editor.current.setPosition({lineNumber:line,column:1});editor.current.focus();}},[line]);
  useEffect(()=>{editor.current?.updateOptions({readOnly});},[readOnly]);
  useEffect(()=>{tabOut.current?.setEnabled(tabOutEnabled&&!readOnly);},[tabOutEnabled,readOnly]);
  useEffect(()=>{markers.current?.set(breakpoints.map(n=>({range:new monaco.Range(n,1,n,1),options:{glyphMarginClassName:executableLines.includes(n)?'debug-breakpoint':'debug-breakpoint pending',glyphMarginHoverMessage:{value:executableLines.includes(n)?'Breakpoint — click to remove':'No executable statement on this line'},stickiness:monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges}})));},[breakpoints,executableLines]);
  useEffect(()=>{trace.current?.set(traceLocation?[{range:new monaco.Range(traceLocation.line,1,traceLocation.line,1),options:{isWholeLine:true,className:'debug-current-line',linesDecorationsClassName:'debug-current-arrow',overviewRuler:{color:'#e7c779',position:monaco.editor.OverviewRulerLane.Full}}}]:[]);if(traceLocation)editor.current?.revealLineInCenterIfOutsideViewport(traceLocation.line);},[traceLocation]);
  return <div className="code-editor" ref={host}/>;
}
