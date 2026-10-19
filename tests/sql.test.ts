import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { columnKind, cteSteps, judgeSql, rewriteMysql, runSql, sameTable, sqlInvalid, type SqlSchema } from '../coding/sql-engine';
import { kitErrors, kitProblem, type KitRecord } from '../coding/kits';
import { validateInput } from '../coding/validation';
import { contractLine, starter } from '../coding/languages';
const SQL = await initSqlJs();
const schema: SqlSchema = { T: [['id', 'INT'], ['name', 'VARCHAR(20)'], ['d', 'DATE'], ['amount', 'DECIMAL(10, 2)']] };
const tables = { T: [[1, 'Alice', '2020-01-31', 10], [2, 'bob', '2020-02-29', 3], [3, null, '2019-12-31', 7.5]] };
const rows = (query: string) => { const run = runSql(SQL, schema, tables, query); assert.equal(run.error, undefined, run.error); return run.result!.rows; };

test('MySQL syntax and functions run in the SQL sandbox with MySQL semantics', () => {
  assert.deepEqual(rows('SELECT 3/2, 7 DIV 2, ROUND(1/3*100, 2)'), [[1.5, 3, 33.33]]);
  assert.deepEqual(rows('SELECT d + INTERVAL 1 MONTH, d - INTERVAL 1 DAY FROM T WHERE id = 1'), [['2020-02-29', '2020-01-30']]);
  assert.deepEqual(rows("SELECT '2019-07-27' - INTERVAL 29 DAY, DATE_SUB('2019-07-27', INTERVAL '29' DAY), DATEDIFF('2020-03-01', '2020-02-28')"), [['2019-06-28', '2019-06-28', 2]]);
  assert.deepEqual(rows("SELECT name FROM T WHERE name = 'BOB'"), [['bob']], 'text compares without case');
  assert.deepEqual(rows("SELECT name REGEXP '^a', REGEXP_LIKE(name, '^a', 'c') FROM T WHERE id = 1"), [[1, 0]]);
  assert.deepEqual(rows("SELECT 'it\\'s', \"double\", 'x_y' LIKE '%\\_%'"), [["it's", 'double', 1]]);
  assert.deepEqual(rows("SELECT GROUP_CONCAT(name ORDER BY id DESC SEPARATOR ';') FROM T"), [['bob;Alice']]);
  assert.deepEqual(rows("SELECT CONCAT(name, '!') FROM T ORDER BY id"), [['Alice!'], ['bob!'], [null]], 'CONCAT is null when a part is null');
  assert.deepEqual(rows("SELECT EXTRACT(YEAR FROM d), CAST('2020-01-05 10:00:00' AS DATE), DATE_FORMAT(d, '%Y-%m'), TIMESTAMPDIFF(MONTH, '2020-01-31', '2020-02-29') FROM T WHERE id = 1"), [[2020, '2020-01-05', '2020-01', 0]]);
  assert.deepEqual(rows("SELECT IF(id > 1, 'big', 'small'), IFNULL(name, '-'), ISNULL(name), LEAST(id, 2) FROM T ORDER BY id"), [['small', 'Alice', 0, 1], ['big', 'bob', 0, 2], ['big', '-', 1, 2]]);
  assert.deepEqual(rows('SELECT id, RANK() OVER (ORDER BY amount DESC) FROM T ORDER BY id'), [[1, 1], [2, 3], [3, 2]]);
  assert.deepEqual(rows('SELECT id -- a comment; with a semicolon\nFROM T /* another; */ WHERE id < 2;'), [[1]]);
  assert.match(runSql(SQL, schema, tables, 'SELECT 1; SELECT 2').error!, /single SQL query/);
  assert.equal(rewriteMysql('SELECT a / b FROM t'), 'SELECT a * 1.0 / b FROM t');
});

test('empty results keep their columns, and UPDATE or DELETE answers are judged by the table they change', () => {
  assert.deepEqual(runSql(SQL, schema, tables, 'SELECT id AS x FROM T WHERE 0').result, { columns: ['x'], rows: [] });
  const people: SqlSchema = { Person: [['id', 'INT'], ['email', 'VARCHAR(50)']] }, data = { Person: [[1, 'a@x'], [2, 'b@x'], [3, 'a@x']] };
  for (const query of ['DELETE p1 FROM Person p1, Person p2 WHERE p1.email = p2.email AND p1.id > p2.id', 'DELETE p1 FROM Person p1 JOIN Person p2 ON p1.email = p2.email AND p1.id > p2.id'])
    assert.deepEqual(runSql(SQL, people, data, query, 'Person').result!.rows, [[1, 'a@x'], [2, 'b@x']]);
});

test('result tables compare by value, numeric text and rounding included, in order only when asked', () => {
  const a = { columns: ['x', 'y'], rows: [[1, 'p'], [2.000001, 'q']] }, b = { columns: ['x', 'y'], rows: [['2.00', 'q'], [1, 'p']] };
  assert.equal(sameTable(a, b, false), true);
  assert.equal(sameTable(a, b, true), false);
  assert.equal(sameTable(a, { columns: ['x', 'y'], rows: [[1, 'p']] }, false), false);
  assert.equal(columnKind("ENUM('Interval', 'Point')"), 'text');
  assert.equal(columnKind('decimal(10, 2)'), 'number');
  assert.equal(columnKind('BIGINT'), 'integer');
});

test('SQL cases are validated per table and column type', () => {
  assert.equal(sqlInvalid(schema, [tables]), null);
  assert.match(sqlInvalid(schema, [{ T: [[1, 'a', '2020-01-01']] }])!, /4 values/);
  assert.match(sqlInvalid(schema, [{ T: [['1', 'a', '2020-01-01', 1]] }])!, /T\.id must be INT/);
  assert.match(sqlInvalid(schema, [{ U: [] }])!, /Unknown table U/);
  assert.match(sqlInvalid(schema, [])!, /\[tables\]/);
});

test('a generated SQL kit loads, validates, judges, and steps through its common table expressions', () => {
  const record: KitRecord = {
    number: 1, title: 'Big spenders', spec: 'leetcode', statement: 'Report each id whose total is at least 10.', constraints: ['id is not null'],
    signature: 'query', entry: 'query', kind: 'sql', parameters: [], schema: { Orders: [['id', 'INT'], ['amount', 'INT']] }, ordered: true, languages: ['sql'],
    reference: 'WITH totals AS (\n  SELECT id, SUM(amount) AS total\n  FROM Orders\n  GROUP BY id\n)\nSELECT id\nFROM totals\nWHERE total >= 10\nORDER BY id;',
    examples: [{ name: 'Example 1', input: [{ Orders: [[1, 4], [2, 12], [1, 6], [3, 9]] }], expected: { columns: ['id'], rows: [[1], [2]] } }],
    tests: [{ name: 'Test 1', input: [{ Orders: [] }] }, { name: 'Test 2', input: [{ Orders: [[5, 10]] }] }], notes: 'Group, then filter.'
  };
  assert.deepEqual(kitErrors(record, 1), []);
  assert.deepEqual(kitErrors({ ...record, languages: ['javascript'] }, 1), ['An SQL kit is judged in sql only.']);
  assert.deepEqual(kitErrors({ ...record, modifies: 'Nope' }, 1), ['modifies must name a table of the schema.']);
  const problem = kitProblem(record);
  assert.equal(validateInput(problem, [{ Orders: [[1, 'x']] }]), 'Orders.amount must be INT or null.');
  assert.equal(starter(problem, 'sql'), '-- Write one MySQL query.\n');
  assert.match(contractLine(problem, 'sql'), /Orders/);
  const cases = [...problem.examples, ...problem.tests];
  assert.equal(judgeSql(SQL, problem, 'SELECT id FROM Orders GROUP BY id HAVING SUM(amount) >= 10 ORDER BY id', cases).verdict, 'Accepted');
  assert.equal(judgeSql(SQL, problem, 'SELECT id FROM Orders GROUP BY id HAVING SUM(amount) > 10 ORDER BY id', cases).verdict, 'Wrong answer');
  assert.equal(judgeSql(SQL, problem, 'SELECT id FROM Orders GROUP BY id HAVING SUM(amount) >= 10 ORDER BY id DESC', cases).verdict, 'Wrong answer', 'row order matters when ordered');
  const renamed = judgeSql(SQL, problem, 'SELECT id AS customer FROM Orders GROUP BY id HAVING SUM(amount) >= 10 ORDER BY id', cases);
  assert.equal(renamed.verdict, 'Wrong answer');
  assert.match(renamed.cases[0].error!, /named id/);
  assert.equal(judgeSql(SQL, problem, 'SELEC id', cases).verdict, 'Syntax error');
  const steps = cteSteps(problem.reference);
  assert.deepEqual(steps.map(s => s.name), ['totals']);
  assert.deepEqual(runSql(SQL, problem.schema!, problem.examples[0].input[0] as any, steps[0].sql).result!.rows, [[1, 10], [2, 12], [3, 9]]);
});
