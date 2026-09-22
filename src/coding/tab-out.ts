import * as monaco from 'monaco-editor/editor/editor.api.js';
import {collectTabOutTargets,tabOutTarget,type TabOutLine} from './tab-out-targets';

/** Only claim a key when a jump is possible, leaving all native fallbacks to Monaco. */
export function installTabOut(editor:monaco.editor.IStandaloneCodeEditor,initiallyEnabled:boolean){
  let enabled=initiallyEnabled,version=-1,lines:TabOutLine[]=[],composing=false;
  const forward=editor.createContextKey<boolean>('studyTabOutForward',false);
  const backward=editor.createContextKey<boolean>('studyTabOutBackward',false);
  const common='editorTextFocus && !editorReadonly && !editorHasSelection && !editorHasMultipleSelections && !editorTabMovesFocus && !suggestWidgetVisible && !inSnippetMode && !inlineSuggestionVisible && !inlineEditIsVisible';
  function targets(){
    const model=editor.getModel(),selection=editor.getSelection();
    if(!enabled||composing||!model||!selection?.isEmpty()||editor.getSelections()?.length!==1||editor.getOption(monaco.editor.EditorOption.readOnly))return {forward:null,backward:null};
    if(version!==model.getVersionId()){
      const source=model.getValue();lines=collectTabOutTargets(source,monaco.editor.tokenize(source,'javascript'));version=model.getVersionId();
    }
    const line=lines[selection.positionLineNumber-1],offset=selection.positionColumn-1;
    return {forward:tabOutTarget(line,offset,'forward'),backward:tabOutTarget(line,offset,'backward')};
  }
  function refresh(){const target=targets();forward.set(target.forward!==null);backward.set(target.backward!==null);}
  function jump(direction:'forward'|'backward'){
    const target=targets()[direction],position=editor.getPosition();
    if(target===null||!position)return;
    const next={lineNumber:position.lineNumber,column:target+1};editor.setPosition(next);editor.revealPositionInCenterIfOutsideViewport(next);
  }
  const disposables=[
    editor.addAction({id:'study.tabOut.forward',label:'TabOut: Jump forward',keybindings:[monaco.KeyCode.Tab],precondition:`${common} && studyTabOutForward`,run:()=>jump('forward')}),
    editor.addAction({id:'study.tabOut.backward',label:'TabOut: Jump backward',keybindings:[monaco.KeyMod.Shift|monaco.KeyCode.Tab],precondition:`${common} && studyTabOutBackward`,run:()=>jump('backward')}),
    editor.onDidChangeCursorSelection(refresh),editor.onDidChangeModelContent(refresh),
    editor.onDidChangeModel(()=>{version=-1;refresh();}),editor.onDidChangeConfiguration(refresh),
    editor.onDidCompositionStart(()=>{composing=true;refresh();}),editor.onDidCompositionEnd(()=>{composing=false;refresh();})
  ];
  refresh();
  return {setEnabled(value:boolean){enabled=value;refresh();},dispose(){disposables.forEach(d=>d.dispose());forward.reset();backward.reset();}};
}
