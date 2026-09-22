import {useEffect,useRef,useState} from 'react';
import type {Entry} from '../../shared/types';
import type {GuidedProgress} from '../../shared/guided';

export default function GuidedWorkspace({entry,progress,active,onError,onSearch}:{entry:Entry;progress?:GuidedProgress;active:boolean;onError:(error:unknown)=>void;onSearch:()=>void}){
  const frame=useRef<HTMLIFrameElement>(null),latest=useRef({progress,active,onError,onSearch});latest.current={progress,active,onError,onSearch};
  const [session]=useState(()=>crypto.randomUUID()),[ready,setReady]=useState(false);
  const protocol=useRef({runId:'',sequence:0,version:0,caseId:''});
  function send(data:Record<string,unknown>){frame.current?.contentWindow?.postMessage({...data,session,lessonId:entry.id},'study://content');}
  useEffect(()=>{
    let mounted=true;
    const listener=(event:MessageEvent)=>{
      if(event.origin!=='study://content'||event.source!==frame.current?.contentWindow)return;
      const message=event.data;
      if(message?.type==='study:activity'){if(latest.current.active)window.study.activity();return;}
      if(message?.type==='study:search'){if(latest.current.active)latest.current.onSearch();return;}
      if(!message||message.session!==session||message.lessonId!==entry.id)return;
      if(message.type==='guided:ready'){
        if(!Number.isSafeInteger(message.version)||message.version<1||message.caseId!=='guided-default')return;
        protocol.current={version:message.version,caseId:message.caseId,runId:'',sequence:0};setReady(true);
        send({type:'guided:init',active:latest.current.active,progress:latest.current.progress??null});return;
      }
      const current=protocol.current;
      if(message.version!==current.version||message.caseId!==current.caseId||!Number.isSafeInteger(message.sequence)||message.sequence<=current.sequence||typeof message.runId!=='string')return;
      if(message.type==='guided:run'){current.sequence=message.sequence;current.runId=message.runId;return;}
      if(message.type==='guided:progress'&&message.runId===current.runId&&message.progress?.runId===current.runId){
        current.sequence=message.sequence;
        void window.study.saveGuidedProgress(entry.id,message.progress).catch(error=>{if(mounted)latest.current.onError(error);});
      }
    };
    window.addEventListener('message',listener);
    const dispose=window.study.onPlaybackPause(()=>send({type:'study:pause'}));
    return()=>{mounted=false;dispose();window.removeEventListener('message',listener);};
  },[entry.id,session]);
  useEffect(()=>{send({type:'guided:active',active});if(!active)send({type:'study:pause'});},[active,ready]);
  return <div className="visualizer-container guided-container" hidden={!active}>
    {!ready&&<div className="frame-loading">Opening guided lesson…</div>}
    <iframe ref={frame} title={`${entry.title} guided lesson`} sandbox="allow-scripts allow-same-origin" allow="fullscreen" allowFullScreen referrerPolicy="no-referrer" src={`study://content/${entry.visualizerPath!.split('/').map(encodeURIComponent).join('/')}?embedded=1&guided=1&session=${session}&parentOrigin=${encodeURIComponent(location.origin)}`}/>
  </div>;
}
