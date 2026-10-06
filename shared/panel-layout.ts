export type PanelView = 'visualizer' | 'learn' | 'debug';
export interface PanelRect { x:number;y:number;width:number;height:number;workspaceWidth:number;z:number;hidden:boolean; }
export interface PanelRegistration { element:HTMLElement;body:HTMLElement;dispose():void; }
export interface PanelLayout {
  register(options:{id:string;title:string;element?:HTMLElement;visible?:boolean;className?:string}):PanelRegistration;
  show(id:string):void;maximize(id:string,enabled?:boolean):void;focus(id:string,enabled:boolean):void;
  cancel():void;refresh():void;subscribe(listener:()=>void):()=>void;
  snapshot():{view:PanelView;maximized:string|null;panels:Record<string,PanelRect & {visible:boolean}>};
  dispose():void;
}
declare global {
  var StudyPanelLayout:{create(options:{host:HTMLElement;view:PanelView;onInteraction?:()=>void;onGeometry?:()=>void}):PanelLayout;parse(value:string|null):Record<string,PanelRect>};
  interface HTMLElement { studyPanelLayout?:PanelLayout; }
  interface Window { studyPanelLayout?:PanelLayout; }
}
