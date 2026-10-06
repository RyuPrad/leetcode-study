import type { VisualLocation, VisualObject, VisualStackFrame, VisualValue, VisualizationFrame } from './visualization';
export type ObjectFrame = Pick<VisualizationFrame, 'stack' | 'objects' | 'truncated'> & Partial<Pick<VisualizationFrame, 'changes' | 'reads' | 'index'>>;
export interface ObjectRoot { id?: string; name: string; scope?: string; value: unknown; }
export interface CaptureOptions { idOf?: (object: object, path: string) => string | undefined; frameId?: number; frameName?: string; location?: VisualLocation; includeNonEnumerable?: boolean; maxEntries?: number; maxObjects?: number; maxDepth?: number; maxBytes?: number; maxStringLength?: number; }
export interface ObjectNode { kind: 'scalar' | 'reference' | 'object'; path: string; depth?: number; text?: string; token?: 'null' | 'number' | 'string' | 'boolean' | 'special' | 'function'; objectId?: string; target?: string; type?: VisualObject['kind']; label?: string; size?: number; aliases?: {name:string;color:string}[]; collapsed?: boolean; entries?: ObjectEntry[]; remaining?: number; truncated?: boolean; }
export interface ObjectEntry { key: string; keyValue?: ObjectNode; value: ObjectNode; changed: boolean; read: boolean; }
export interface ObjectVariable { id: string; name: string; color: string; changed: boolean; value: ObjectNode; }
export interface ObjectModel { frames: { id: number; name: string; location: VisualStackFrame['location']; scopes: { name: string; variables: ObjectVariable[] }[] }[]; truncated: boolean; }
export interface FormatOptions { collapsed?: Set<string>; expanded?: Set<string>; depthLimit?: number; entryLimit?: number; previousFrame?: ObjectFrame; }
export interface ObjectFocus { frameId: number; variableId: string; }
export interface RenderOptions extends FormatOptions { runId?: unknown; mode?: 'reference' | 'code'; onFocusChange?: (selection: ObjectFocus | null) => void; }
export interface ObjectViewApi { capture(roots: Record<string, unknown> | ObjectRoot[], options?: CaptureOptions): ObjectFrame; special(text: string): VisualValue; format(frame: ObjectFrame, options?: FormatOptions): ObjectModel; render(container: HTMLElement, frame: ObjectFrame, options?: RenderOptions): ObjectModel; reset(container: HTMLElement): void; }
declare global { var StudyObjectView: ObjectViewApi; }
