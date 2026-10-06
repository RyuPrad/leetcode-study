import {createContext,useContext,useLayoutEffect,useRef,useState,type ReactNode,type RefObject} from 'react';
import {createPortal} from 'react-dom';
import type {PanelLayout,PanelRegistration,PanelView} from '../../shared/panel-layout';
import '../../visualizer-ui/panel-layout.js';
import '../../visualizer-ui/panel-layout.css';

const Context=createContext<PanelLayout|null>(null);
export const usePanelLayout=()=>useContext(Context);

export function PanelWorkspace({view,children,onInteraction,layoutRef}:{view:PanelView;children:ReactNode;onInteraction:()=>void;layoutRef?:RefObject<PanelLayout|null>}){
  const host=useRef<HTMLDivElement>(null),callback=useRef(onInteraction);callback.current=onInteraction;
  const [layout,setLayout]=useState<PanelLayout|null>(null);
  useLayoutEffect(()=>{
    const manager=StudyPanelLayout.create({host:host.current!,view,onInteraction:()=>callback.current()});
    setLayout(manager);if(layoutRef)layoutRef.current=manager;
    return()=>{if(layoutRef)layoutRef.current=null;manager.dispose();};
  },[view]);
  return <Context.Provider value={layout}><div ref={host} className="debug-panel-workspace"/>{layout&&children}</Context.Provider>;
}

export function StudyPanel({id,title,children,bodyClassName='',autoShow=false}:{id:string;title:string;children:ReactNode;bodyClassName?:string;autoShow?:boolean}){
  const layout=usePanelLayout(),[registration,setRegistration]=useState<PanelRegistration|null>(null);
  useLayoutEffect(()=>{
    if(!layout)return;
    const panel=layout.register({id,title});panel.body.className+=` ${bodyClassName}`;setRegistration(panel);
    if(autoShow)layout.show(id);
    return()=>panel.dispose();
  },[layout,id,title]);
  return registration?createPortal(children,registration.body):null;
}
