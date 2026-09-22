import type { CodeCase, Json } from './coding';
import type { VisualizationFrame } from './visualization';
export type DebugMotion = 'continue' | 'into' | 'over' | 'out' | 'play';
export type DebugCommand =
  | { type: 'start'; sessionId: string; problemId: string; source: string; test: CodeCase; breakpoints: number[] }
  | { type: 'motion'; sessionId: string; motion: DebugMotion; speed?: number; presentation?: 'detailed'|'compact' }
  | { type: 'presented'; sessionId: string; index: number }
  | { type: 'pause'; sessionId: string }
  | { type: 'breakpoints'; sessionId: string; lines: number[] };
export type DebugEvent =
  | { type: 'started'; sessionId: string; executableLines: number[] }
  | { type: 'frame'; sessionId: string; frame: VisualizationFrame; paused: boolean; reason: string }
  | { type: 'running'; sessionId: string }
  | { type: 'finished'; sessionId: string; actual?: Json; expected?: Json; accepted?: boolean; error?: string; logs: string[]; durationMs: number };
export const DEBUG_TIME_LIMIT = 10000;
export const DEBUG_HISTORY_LIMIT = 5000;
export const DEBUG_HISTORY_BYTES = 32 * 1024 * 1024;
