import { useEffect, useState } from 'react';
import type { CodingProblem, Json } from '../../shared/coding';
import type { SqlResult, SqlTables } from '../../coding/sql-engine';

/** One table of values, as LeetCode prints SQL tables. */
export function SqlTable({ name, table }: { name?: string; table: SqlResult }) {
  return <figure className="sql-table">
    {name && <figcaption>{name}</figcaption>}
    <div className="sql-table-scroll"><table><thead><tr>{table.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
      <tbody>{table.rows.length ? table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c} className={cell === null ? 'sql-null' : ''}>{cell === null ? 'null' : String(cell)}</td>)}</tr>) : <tr><td colSpan={Math.max(1, table.columns.length)} className="sql-empty">No rows</td></tr>}</tbody></table></div>
  </figure>;
}
/** A case's input tables, in schema order. */
export function SqlInputTables({ schema, input }: { schema?: CodingProblem['schema']; input: Json[] }) {
  const tables = (input[0] ?? {}) as SqlTables;
  return <div className="sql-tables">{Object.entries(schema ?? {}).map(([name, columns]) => <SqlTable key={name} name={name} table={{ columns: columns.map(c => c[0]), rows: tables[name] ?? [] }}/>)}</div>;
}

interface Step { title: string; note?: string; tables: { name?: string; table: SqlResult }[]; lines?: [number, number]; }
/** A generated SQL kit's walkthrough: the input tables, each common table expression's result, then the answer. */
export default function SqlWalkthrough({ problem, narration = {} }: { problem: CodingProblem; narration?: Record<string, string> }) {
  const [selected, setSelected] = useState(0), [steps, setSteps] = useState<Step[] | null>(null), [error, setError] = useState(''), [cursor, setCursor] = useState(0);
  const example = problem.examples[selected];
  useEffect(() => {
    let live = true; setSteps(null); setError(''); setCursor(0);
    (async () => {
      const [{ default: initSqlJs }, { runSql, cteSteps }, { default: wasm }] = await Promise.all([import('sql.js'), import('../../coding/sql-engine'), import('sql.js/dist/sql-wasm.wasm?url')]);
      const SQL = await initSqlJs({ locateFile: () => wasm }), schema = problem.schema ?? {}, tables = example.input[0] as unknown as SqlTables;
      const lineOf = (offset: number) => problem.reference.slice(0, offset).split('\n').length;
      const noteFor = (from: number, to: number) => Object.entries(narration).filter(([line]) => Number(line) >= from && Number(line) <= to).map(([, note]) => note).join(' ');
      const result: Step[] = [{ title: 'Input tables', note: 'The query starts from these tables.', tables: Object.entries(schema).map(([name, columns]) => ({ name, table: { columns: columns.map(c => c[0]), rows: tables[name] ?? [] } })) }];
      let previousEnd = 0;
      for (const cte of cteSteps(problem.reference)) {
        const run = runSql(SQL, schema, tables, cte.sql), lines: [number, number] = [lineOf(cte.start), lineOf(cte.end)];
        result.push({ title: `${cte.name}`, note: noteFor(...lines) || `The rows of ${cte.name}.`, tables: run.result ? [{ name: cte.name, table: run.result }] : [], lines });
        if (run.error) throw new Error(run.error);
        previousEnd = cte.end;
      }
      const final = runSql(SQL, schema, tables, problem.reference, problem.modifies);
      if (!final.result) throw new Error(final.error);
      const lines: [number, number] = [lineOf(previousEnd), problem.reference.split('\n').length];
      result.push({ title: 'Result', note: noteFor(...lines) || 'The final SELECT produces the answer.', tables: [{ name: 'Result', table: final.result }, ...(example.expected ? [{ name: 'Expected', table: example.expected as unknown as SqlResult }] : [])], lines });
      if (live) setSteps(result);
    })().catch(e => { if (live) setError(String(e instanceof Error ? e.message : e)); });
    return () => { live = false; };
  }, [problem, selected]);
  const step = steps?.[cursor];
  return <div className="walkthrough-workspace sql-walkthrough">
    <header className="debug-toolbar walkthrough-toolbar"><strong>Walkthrough</strong>
      <label>Input <select aria-label="Walkthrough input" value={selected} onChange={e => setSelected(Number(e.target.value))}>{problem.examples.map((e, i) => <option key={i} value={i}>{e.name}</option>)}</select></label>
      <span className="debug-status" role="status">{error ? 'The walkthrough could not run' : steps ? `Step ${cursor + 1} of ${steps.length}` : 'Running the reference query…'}</span></header>
    <div className="debug-controls walkthrough-controls">
      <button aria-label="Previous step" disabled={!steps || cursor === 0} onClick={() => setCursor(c => c - 1)}>←</button>
      <button aria-label="Next step" disabled={!steps || cursor >= steps.length - 1} onClick={() => setCursor(c => c + 1)}>→</button>
      <input aria-label="Walkthrough timeline" type="range" min={0} max={Math.max(0, (steps?.length ?? 1) - 1)} value={cursor} disabled={!steps} onChange={e => setCursor(Number(e.target.value))}/>
    </div>
    <section className="walkthrough-narration" aria-live="polite" aria-label="What this step does">{step && <span className="walkthrough-line">{step.title}</span>}<p>{error || step?.note || 'Running the reference query…'}</p></section>
    <div className="sql-walkthrough-body">
      <pre className="sql-reference" aria-label="Reference query">{problem.reference.split('\n').map((line, i) => <span key={i} className={step?.lines && i + 1 >= step.lines[0] && i + 1 <= step.lines[1] ? 'active' : ''}>{line}{'\n'}</span>)}</pre>
      <div className="sql-tables">{step?.tables.map((t, i) => <SqlTable key={`${cursor}-${i}`} name={t.name} table={t.table}/>)}</div>
    </div>
  </div>;
}
