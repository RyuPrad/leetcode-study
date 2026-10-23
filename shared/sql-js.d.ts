// The part of sql.js (SQLite in WebAssembly) that coding/sql-engine.ts uses.
declare module 'sql.js' {
  export interface QueryExecResult { columns: string[]; values: (number | string | null | Uint8Array)[][]; }
  export interface Statement { run(values?: unknown[]): void; step(): boolean; get(): (number | string | null | Uint8Array)[]; getColumnNames(): string[]; free(): boolean; }
  export interface Database {
    run(sql: string): Database;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    create_function(name: string, fn: (...args: any[]) => unknown): Database;
    // The step function's length minus one (the state) is the aggregate's argument count.
    create_aggregate(name: string, functions: { init?: () => unknown; step: (state: any, ...args: any[]) => unknown; finalize?: (state: any) => unknown }): Database;
    close(): void;
  }
  export interface SqlJsStatic { Database: new () => Database; }
  export default function initSqlJs(config?: { locateFile?: (file: string) => string; wasmBinary?: ArrayBuffer | Uint8Array }): Promise<SqlJsStatic>;
}
