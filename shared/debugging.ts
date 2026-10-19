import type { CodeCase, CodingProblem, Json, Language } from './coding';
import type { VisualizationFrame } from './visualization';
export type DebugMotion = 'continue' | 'into' | 'over' | 'out' | 'play';
export type DebugCommand =
  | { type: 'start'; sessionId: string; problemId: string; language: Language; source: string; test: CodeCase; breakpoints: number[]; problem?: CodingProblem }
  // Runs the source to completion, stepping into every statement, and returns every frame at once.
  | { type: 'record'; sessionId: string; problem: CodingProblem; language: Language; source: string; test: CodeCase; limit: number }
  | { type: 'motion'; sessionId: string; motion: DebugMotion; speed?: number; presentation?: 'detailed'|'compact' }
  | { type: 'presented'; sessionId: string; index: number }
  | { type: 'pause'; sessionId: string }
  | { type: 'breakpoints'; sessionId: string; lines: number[] };
export type DebugEvent =
  | { type: 'started'; sessionId: string; executableLines: number[] }
  | { type: 'frame'; sessionId: string; frame: VisualizationFrame; paused: boolean; reason: string }
  | { type: 'running'; sessionId: string }
  | { type: 'finished'; sessionId: string; actual?: Json; expected?: Json; accepted?: boolean; error?: string; logs: string[]; durationMs: number }
  | { type: 'recorded'; sessionId: string; frames: VisualizationFrame[]; truncated: boolean; actual?: Json; error?: string; logs: string[]; executableLines: number[] };
/** Frames a walkthrough records before it stops and reports a truncated run. */
export const WALKTHROUGH_FRAME_LIMIT = 2000;
export const DEBUG_TIME_LIMIT = 10000;
export const DEBUG_HISTORY_LIMIT = 5000;
export const DEBUG_HISTORY_BYTES = 32 * 1024 * 1024;
