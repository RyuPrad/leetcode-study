export type VisualValue = null | boolean | number | string | { ref: string } | { special: string };
export interface VisualEntry { key: string; value: VisualValue; keyValue?: VisualValue; }
export interface VisualObject { id: string; kind: 'array' | 'object' | 'map' | 'set' | 'function' | 'tree' | 'list' | 'graph'; label: string; entries: VisualEntry[]; size?: number; truncated?: boolean; }
export interface VisualVariable { id: string; name: string; scope: string; value: VisualValue; }
export interface VisualLocation { line: number; column: number; endLine: number; endColumn: number; }
export interface VisualStackFrame { id: number; name: string; location: VisualLocation; variables: VisualVariable[]; }
export interface VisualChange { name: string; before?: VisualValue; after?: VisualValue; objectId?: string; key?: string; }
export interface ReferenceInstruction { line: number; phase: string; }
/** One committed reference instruction, retained for the current input/run. */
export interface ReferenceTransition {
  fromIndex: number;
  toIndex: number;
  instruction: ReferenceInstruction;
  beforeInputs: Record<string, string>;
  afterInputs: Record<string, string>;
  context: Record<string, null | boolean | number | string>;
  changes: VisualChange[];
  action: string;
  resultCaption?: string;
}
export type OperationKind = 'read' | 'lookup' | 'compare' | 'calculate' | 'write' | 'copy' | 'swap' | 'remove' | 'pointer' | 'call' | 'return' | 'control';
export interface VisualOperation {
  kind: OperationKind;
  location: VisualLocation;
  focus: string;
  action: string;
  result: string;
  targets?: {objectId: string; key?: string}[];
  /** Only explicit, observed relationships belong here. Reads plus writes do not prove a transfer. */
  links?: {from: {objectId: string; key: string}; to: {objectId: string; key: string}; label: string}[];
}
export interface VisualizationFrame {
  index: number;
  location: VisualLocation;
  phase: string;
  action: string;
  explanation: string;
  stack: VisualStackFrame[];
  objects: VisualObject[];
  reads: { objectId: string; key: string }[];
  changes: VisualChange[];
  logs: string[];
  truncated?: boolean;
  operations?: VisualOperation[];
}
export interface LessonAdapter {
  snapshot(): VisualizationFrame;
  currentTransition?(): ReferenceTransition | null;
  next(): void;
  previous(): void;
  reset(): void;
  seek(index: number): Promise<void>;
  subscribe(listener: (frame: VisualizationFrame) => void): () => void;
  /** Guided mode reloads its authored example; exploration adapters omit this. */
  loadGuidedCase?(): Promise<void>;
}
export const valueText = (value: VisualValue | undefined): string => value === undefined ? 'not present' : value !== null && typeof value === 'object' ? 'ref' in value ? value.ref : value.special : typeof value === 'string' ? JSON.stringify(value) : String(value);
export function frameChanges(before: VisualizationFrame | undefined, after: VisualizationFrame): VisualChange[] {
  if (!before) return [];
  const changes: VisualChange[] = [], equal = (a: unknown,b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const oldVariables = new Map(before.stack.flatMap(f=>f.variables.map(v=>[`${f.id}:${v.id}`,v] as const)));
  for (const frame of after.stack) for (const variable of frame.variables) {
    const previous=oldVariables.get(`${frame.id}:${variable.id}`);
    if ((!previous || !equal(previous.value,variable.value)) && !(typeof variable.value === 'object' && variable.value && 'special' in variable.value && variable.value.special === 'not initialized')) changes.push({name:variable.name,before:previous?.value,after:variable.value});
  }
  const oldObjects = new Map(before.objects.map(o=>[o.id,o]));
  for (const object of after.objects) {
    const previous=oldObjects.get(object.id); if(!previous)continue;
    const oldEntries=new Map(previous.entries.map(e=>[e.key,e.value])), newEntries=new Map(object.entries.map(e=>[e.key,e.value]));
    for (const key of new Set([...oldEntries.keys(),...newEntries.keys()])) if(!equal(oldEntries.get(key),newEntries.get(key))) changes.push({name:`${object.id}[${key}]`,objectId:object.id,key,before:oldEntries.get(key),after:newEntries.get(key)});
  }
  return changes.slice(0,200);
}
