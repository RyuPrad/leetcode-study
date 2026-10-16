// Generates the C program for one job: LeetCode's prelude, the user's solution under
// #line 1 "solution.c", and a harness that builds each case's arguments with LeetCode's C
// conventions, calls the solution and writes the JSON result that coding/harness.js would
// produce. `solution.exe <case> <result-file>` runs one case, so a crash fails only that case.
import type { CodingProblem, Json } from '../shared/coding';
import { cDesignFunction, cScalar, cShape, contract, type Method, type Param } from './languages';

const PRELUDE = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <stdint.h>
#include <limits.h>
#include <math.h>
#include <ctype.h>
#include <time.h>
#include "uthash.h"
struct ListNode { int val; struct ListNode *next; };
struct TreeNode { int val; struct TreeNode *left; struct TreeNode *right; };
`;
const NODES: Record<number, string> = {
  133: 'struct Node { int val; int numNeighbors; struct Node** neighbors; };\n',
  138: 'struct Node { int val; struct Node *next; struct Node *random; };\n',
  116: 'struct Node { int val; struct Node *left; struct Node *right; struct Node *next; };\n',
  427: 'struct Node { bool val; bool isLeaf; struct Node *topLeft; struct Node *topRight; struct Node *bottomLeft; struct Node *bottomRight; };\n'
};
const API: Record<number, string> = {
  374: 'int guess(int num);\n',
  1095: 'typedef struct MountainArray MountainArray;\nint get(MountainArray* mountainArr, int index);\nint length(MountainArray* mountainArr);\n'
};

// Runtime shared by every generated case: output buffer, JSON writers, builders and checks.
const RUNTIME = String.raw`
static const char* study_result_path;
static char* study_out; static size_t study_len, study_cap;
static void study_raw(const char* s, size_t n) {
  if (study_len + n + 1 > study_cap) { study_cap = (study_len + n + 1) * 2; study_out = (char*)realloc(study_out, study_cap); }
  memcpy(study_out + study_len, s, n); study_len += n; study_out[study_len] = 0;
}
static void study_text(const char* s) { study_raw(s, strlen(s)); }
static void study_finish(const char* key, double ms) {
  FILE* f = fopen(study_result_path, "wb");
  if (!f) exit(70);
  fprintf(f, "{\"%s\":", key); fwrite(study_out ? study_out : "null", 1, study_out ? study_len : 4, f); fprintf(f, ",\"durationMs\":%.3f}", ms); fclose(f);
}
static void study_quote(const char* s) {
  char buf[8]; study_text("\"");
  for (const unsigned char* p = (const unsigned char*)s; *p; p++) {
    if (*p == '"' || *p == '\\') { buf[0] = '\\'; buf[1] = (char)*p; study_raw(buf, 2); }
    else if (*p < 0x20) { sprintf(buf, "\\u%04x", *p); study_text(buf); }
    else study_raw((const char*)p, 1);
  }
  study_text("\"");
}
static void study_fail(const char* message) {
  study_len = 0; study_quote(message);
  FILE* f = fopen(study_result_path, "wb");
  if (f) { fprintf(f, "{\"error\":"); fwrite(study_out, 1, study_len, f); fprintf(f, "}"); fclose(f); }
  exit(0);
}
static void study_int(long long v) { char buf[32]; sprintf(buf, "%lld", v); study_text(buf); }
static void study_uint(unsigned long long v) { char buf[32]; sprintf(buf, "%llu", v); study_text(buf); }
static void study_double(double v) { char buf[40]; if (v != v || v > 1.7976931348623157e308 || v < -1.7976931348623157e308) { study_text("null"); return; } sprintf(buf, "%.17g", v); study_text(buf); }
static void study_bool(bool v) { study_text(v ? "true" : "false"); }
static void study_char(char c) { char s[2] = { c, 0 }; study_quote(s); }
static void study_str(const char* s) { if (!s) study_text("null"); else study_quote(s); }
#define STUDY_SEP(i) do { if (i) study_text(","); } while (0)
static void study_check_array(const void* p, int n, const char* what) {
  if (n < 0) { char m[96]; sprintf(m, "Set *%s to the returned length.", what); study_fail(m); }
  if (n > 0 && !p) study_fail("A NULL array was returned with a positive size.");
}
static void study_ints(const int* p, int n) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_int(p[i]); } study_text("]"); }
static void study_longs(const long long* p, int n) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_int(p[i]); } study_text("]"); }
static void study_doubles(const double* p, int n) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_double(p[i]); } study_text("]"); }
static void study_bools(const bool* p, int n) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_bool(p[i]); } study_text("]"); }
static void study_chars(const char* p, int n) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_char(p[i]); } study_text("]"); }
static void study_strs(char** p, int n) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_str(p[i]); } study_text("]"); }
static void study_columns(const int* cols, int n) { if (n > 0 && !cols) study_fail("Set *returnColumnSizes to the column sizes."); }
static void study_ints2(int** p, int n, const int* cols) { study_check_array(p, n, "returnSize"); study_columns(cols, n); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_ints(p[i], cols[i]); } study_text("]"); }
static void study_chars2(char** p, int n, const int* cols) { study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_chars(p[i], cols[i]); } study_text("]"); }
static void study_strs2(char*** p, int n, const int* cols) { study_check_array(p, n, "returnSize"); study_columns(cols, n); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_strs(p[i], cols[i]); } study_text("]"); }

/* Pointer set for cycle, sharing and deep-copy checks. */
typedef struct { const void** slots; size_t cap, size; } StudySet;
static size_t study_hash(const void* p) { uintptr_t x = (uintptr_t)p; x ^= x >> 17; x *= 0x9E3779B97F4A7C15ull; return (size_t)(x ^ (x >> 29)); }
static bool study_has(StudySet* s, const void* p) { if (!s->cap) return false; for (size_t i = study_hash(p) & (s->cap - 1);; i = (i + 1) & (s->cap - 1)) { if (!s->slots[i]) return false; if (s->slots[i] == p) return true; } }
static bool study_add(StudySet* s, const void* p) {
  if ((s->size + 1) * 2 > s->cap) {
    StudySet next = { (const void**)calloc(s->cap ? s->cap * 2 : 64, sizeof(void*)), s->cap ? s->cap * 2 : 64, 0 };
    for (size_t i = 0; i < s->cap; i++) if (s->slots[i]) study_add(&next, s->slots[i]);
    free(s->slots); *s = next;
  }
  for (size_t i = study_hash(p) & (s->cap - 1);; i = (i + 1) & (s->cap - 1)) { if (!s->slots[i]) { s->slots[i] = p; s->size++; return true; } if (s->slots[i] == p) return false; }
}

static void* study_copy(const void* src, size_t bytes) { void* p = malloc(bytes ? bytes : 1); if (bytes) memcpy(p, src, bytes); return p; }
static char* study_dup(const char* s) { return (char*)study_copy(s, strlen(s) + 1); }
static char** study_dups(int n, const char* const* src) { char** out = (char**)malloc(sizeof(char*) * (n ? n : 1)); for (int i = 0; i < n; i++) out[i] = study_dup(src[i]); return out; }
static char* study_row(int n, const char* src) { char* p = (char*)malloc(n + 1); memcpy(p, src, n); p[n] = 0; return p; }

static struct ListNode* study_list(int n, const int* v) {
  struct ListNode* head = NULL; struct ListNode** tail = &head;
  for (int i = 0; i < n; i++) { struct ListNode* node = (struct ListNode*)malloc(sizeof *node); node->val = v[i]; node->next = NULL; *tail = node; tail = &node->next; }
  return head;
}
static void study_out_list(struct ListNode* head) {
  StudySet seen = { 0 }; int count = 0; study_text("[");
  for (; head; head = head->next) { if (!study_add(&seen, head) || count > 10000) study_fail("Output list contains a cycle or is too large."); STUDY_SEP(count); study_int(head->val); count++; }
  study_text("]");
}
static void study_lists(struct ListNode** p, int n) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_out_list(p[i]); } study_text("]"); }
static struct TreeNode* study_tree_node(int v) { struct TreeNode* n = (struct TreeNode*)malloc(sizeof *n); n->val = v; n->left = n->right = NULL; return n; }
/* Level order with nulls, as in LeetCode: present[i] is false for null. */
static struct TreeNode* study_tree(int n, const int* v, const bool* present) {
  if (!n || !present[0]) return NULL;
  struct TreeNode** queue = (struct TreeNode**)malloc(sizeof(void*) * n); int head = 0, tail = 0, i = 1;
  struct TreeNode* root = study_tree_node(v[0]); queue[tail++] = root;
  while (head < tail && i < n) {
    struct TreeNode* node = queue[head++];
    if (i < n && present[i]) { node->left = study_tree_node(v[i]); queue[tail++] = node->left; } i++;
    if (i < n && present[i]) { node->right = study_tree_node(v[i]); queue[tail++] = node->right; } i++;
  }
  free(queue); return root;
}
/* shared allows one subtree to appear more than once (894 builds trees from shared subtrees). */
static void study_out_tree_from(struct TreeNode* root, bool shared) {
  int cap = 64, size = 0, head = 0, emitted = 0, pending = 0; struct TreeNode** queue = (struct TreeNode**)malloc(sizeof(void*) * cap); StudySet seen = { 0 };
  queue[size++] = root; study_text("[");
  for (; head < size; head++) {
    struct TreeNode* node = queue[head];
    /* Trailing nulls are trimmed, so nulls are only written once a value follows them. */
    if (!node) { pending++; continue; }
    if ((!shared && !study_add(&seen, node)) || size > 20000) study_fail("Output tree contains a cycle, shared node, or is too large.");
    for (; pending; pending--) { STUDY_SEP(emitted); study_text("null"); emitted++; }
    STUDY_SEP(emitted); study_int(node->val); emitted++;
    if (size + 2 > cap) { cap *= 2; queue = (struct TreeNode**)realloc(queue, sizeof(void*) * cap); }
    queue[size++] = node->left; queue[size++] = node->right;
  }
  study_text("]"); free(queue);
}
static void study_out_tree(struct TreeNode* root) { study_out_tree_from(root, false); }
static void study_trees(struct TreeNode** p, int n, bool shared) { study_check_array(p, n, "returnSize"); study_text("["); for (int i = 0; i < n; i++) { STUDY_SEP(i); study_out_tree_from(p[i], shared); } study_text("]"); }
static struct TreeNode* study_find(struct TreeNode* node, int val) {
  if (!node) return NULL; if (node->val == val) return node;
  struct TreeNode* left = study_find(node->left, val); return left ? left : study_find(node->right, val);
}
static double study_ms(clock_t start) { return (double)(clock() - start) * 1000.0 / CLOCKS_PER_SEC; }
`;

// ---- C literals ---------------------------------------------------------------------
const INT_MIN = -(2 ** 31);
function cNumber(base: string, value: Json, number: number): string {
  const n = value as number;
  if (base === 'double') return Number.isInteger(n) ? `${n}.0` : String(n);
  if (base === 'long') return `${n}LL`;
  if (number === 190) return `${n}u`;
  return n === INT_MIN ? '(-2147483647-1)' : String(n);
}
export function cString(text: string): string {
  let out = '"';
  for (const byte of Buffer.from(text, 'utf8')) {
    if (byte === 0x22 || byte === 0x5c) out += '\\' + String.fromCharCode(byte);
    else if (byte >= 0x20 && byte < 0x7f && byte !== 0x3f) out += String.fromCharCode(byte);
    // Octal escapes keep UTF-8 bytes exact; '?' is escaped to avoid trigraphs.
    else out += '\\' + byte.toString(8).padStart(3, '0');
  }
  return out + '"';
}
const cChar = (value: Json) => { const c = String(value); return c === "'" ? "'\\''" : c === '\\' ? "'\\\\'" : /^[\x20-\x7e]$/.test(c) ? `'${c}'` : `'\\${c.charCodeAt(0).toString(8).padStart(3, '0')}'`; };
function scalarLiteral(base: string, value: Json, number: number): string {
  if (base === 'boolean') return value ? 'true' : 'false';
  if (base === 'char') return cChar(value);
  if (base === 'String') return `study_dup(${cString(value as string)})`;
  return cNumber(base, value, number);
}
const cElement = (base: string) => base === 'String' ? 'char*' : cScalar(base);
/** A heap copy of a flat array, as LeetCode passes them. */
function flat(base: string, values: Json[], number: number): string {
  if (base === 'String') return `study_dups(${values.length}, (const char* const[]){${values.length ? values.map(v => cString(v as string)).join(',') : 'NULL'}})`;
  if (base === 'char') return `study_row(${values.length}, ${cString((values as string[]).join(''))})`;
  const type = cScalar(base);
  return `(${type}*)study_copy((const ${type}[]){${values.length ? values.map(v => scalarLiteral(base, v, number)).join(',') : '0'}}, sizeof(${type}) * ${values.length})`;
}

interface Built { setup: string[]; args: string[]; }
/** Statements that build one argument, and the C arguments it expands to. */
function build(param: Param, value: Json, name: string, number: number): Built {
  const { depth, base } = cShape(param.type);
  if (depth === 0) {
    if (base === 'ListNode') { const v = value as number[]; return { setup: [`struct ListNode* ${name} = study_list(${v.length}, (const int[]){${v.join(',') || '0'}});`], args: [name] }; }
    if (base === 'TreeNode') {
      const v = value as (number | null)[];
      return { setup: [`struct TreeNode* ${name} = study_tree(${v.length}, (const int[]){${v.map(x => x ?? 0).join(',') || '0'}}, (const bool[]){${v.map(x => x === null ? 'false' : 'true').join(',') || 'false'}});`], args: [name] };
    }
    const type = number === 190 ? 'uint32_t' : base === 'String' ? 'char*' : cScalar(base);
    return { setup: [`${type} ${name} = ${scalarLiteral(base, value, number)};`], args: [name] };
  }
  const rows = value as Json[];
  if (depth === 1) {
    if (base === 'ListNode') return { setup: [`int ${name}Size = ${rows.length};`, `struct ListNode** ${name} = (struct ListNode**)malloc(sizeof(void*) * ${rows.length || 1});`,
      ...rows.map((row, i) => `${name}[${i}] = study_list(${(row as number[]).length}, (const int[]){${(row as number[]).join(',') || '0'}});`)], args: [name, `${name}Size`] };
    return { setup: [`int ${name}Size = ${rows.length};`, `${cElement(base)}* ${name} = ${flat(base, rows, number)};`], args: [name, `${name}Size`] };
  }
  return {
    setup: [`int ${name}Size = ${rows.length};`, `int* ${name}ColSize = ${flat('int', rows.map(r => (r as Json[]).length), number)};`,
      `${cElement(base)}** ${name} = (${cElement(base)}**)malloc(sizeof(void*) * ${rows.length || 1});`,
      ...rows.map((row, i) => `${name}[${i}] = ${flat(base, row as Json[], number)};`)],
    args: [name, `${name}Size`, `${name}ColSize`]
  };
}

/** Writes the value of `type` held in `expr` (with its size variables) as JSON. */
function write(type: string, expr: string, size = `${expr}Size`, cols = `${expr}ColSize`, number = 0): string {
  const { depth, base } = cShape(type);
  if (depth === 0) {
    if (base === 'ListNode') return `study_out_list(${expr});`;
    if (base === 'TreeNode') return `study_out_tree(${expr});`;
    if (base === 'boolean') return `study_bool(${expr});`;
    if (base === 'double') return `study_double(${expr});`;
    if (base === 'char') return `study_char(${expr});`;
    if (base === 'String') return `study_str(${expr});`;
    return number === 190 ? `study_uint(${expr});` : `study_int(${expr});`;
  }
  if (depth === 1 && base === 'TreeNode') return `study_trees(${expr}, ${size}, ${number === 894 ? 'true' : 'false'});`;
  if (depth === 1) return { int: 'study_ints', long: 'study_longs', double: 'study_doubles', boolean: 'study_bools', char: 'study_chars', String: 'study_strs', ListNode: 'study_lists' }[base] + `(${expr}, ${size});`;
  return { int: 'study_ints2', char: 'study_chars2', String: 'study_strs2' }[base] + `(${expr}, ${size}, ${cols});`;
}

function callReturning(m: Method, call: string, number: number): string[] {
  const { depth } = cShape(m.returns);
  const type = number === 190 ? 'uint32_t' : depth === 0 ? (m.returns === 'String' ? 'char*' : cScalar(m.returns)) : `${cElement(cShape(m.returns).base)}${'*'.repeat(depth)}`;
  const out = depth === 0 ? [] : depth === 1 ? ['&returnSize'] : ['&returnSize', '&returnColumnSizes'];
  const fullCall = call.replace(/\)$/, `${call.endsWith('()') || !out.length ? '' : ', '}${out.join(', ')})`);
  return [
    ...(depth ? ['int returnSize = -1;'] : []), ...(depth === 2 ? ['int* returnColumnSizes = NULL;'] : []),
    ...(m.returns === 'void' ? [`${fullCall};`] : [`${type} result = ${fullCall};`])
  ];
}
const args = (built: Built[]) => built.flatMap(b => b.args).join(', ');

// ---- Per-problem case bodies ----------------------------------------------------------
function functionCase(problem: CodingProblem, m: Method, input: Json[]): string[] {
  const n = problem.number, lines: string[] = [];
  if (n === 141) {
    const values = input[0] as number[], pos = input[1] as number;
    lines.push(`struct ListNode* head = study_list(${values.length}, (const int[]){${values.join(',') || '0'}});`);
    if (values.length && pos >= 0) lines.push(`{ struct ListNode* target = head; for (int i = 0; i < ${pos}; i++) target = target->next; struct ListNode* tail = head; while (tail->next) tail = tail->next; tail->next = target; }`);
    return [...lines, 'clock_t start = clock();', `bool result = ${m.name}(head);`, 'double ms = study_ms(start);', 'study_bool(result);', 'study_finish("actual", ms);'];
  }
  if (n === 116) {
    const values = input[0] as number[];
    return [
      `int count = ${values.length}; const int values[] = {${values.join(',') || '0'}};`,
      'struct Node** nodes = (struct Node**)malloc(sizeof(void*) * (count ? count : 1));',
      'for (int i = 0; i < count; i++) { nodes[i] = (struct Node*)malloc(sizeof(struct Node)); nodes[i]->val = values[i]; nodes[i]->next = NULL; }',
      'for (int i = 0; i < count; i++) { nodes[i]->left = 2 * i + 1 < count ? nodes[2 * i + 1] : NULL; nodes[i]->right = 2 * i + 2 < count ? nodes[2 * i + 2] : NULL; }',
      'clock_t start = clock();', 'struct Node* root = connect(count ? nodes[0] : NULL);', 'double ms = study_ms(start);',
      'if (root != (count ? nodes[0] : NULL)) study_fail("Return the root of the input tree.");',
      'for (int i = 0; i < count; i++) if (nodes[i]->val != values[i] || nodes[i]->left != (2 * i + 1 < count ? nodes[2 * i + 1] : NULL) || nodes[i]->right != (2 * i + 2 < count ? nodes[2 * i + 2] : NULL)) study_fail("The tree must keep its structure.");',
      'int emitted = 0; study_text("[");',
      'for (int first = 0; first < count; first = 2 * first + 1) { int seen = 0; for (struct Node* node = nodes[first]; node; node = node->next) { if (++seen > count) study_fail("next pointers form a cycle."); STUDY_SEP(emitted); study_int(node->val); emitted++; } STUDY_SEP(emitted); study_text("\\"#\\""); emitted++; }',
      'study_text("]");', 'study_finish("actual", ms);'
    ];
  }
  if (n === 160) {
    const [a, b, skipA, skipB] = input as [number[], number[], number, number];
    return [
      `int m = ${a.length}, skipA = ${skipA}, skipB = ${skipB}; const int a[] = {${a.join(',') || '0'}}; const int b[] = {${b.join(',') || '0'}};`,
      'struct ListNode** nodes = (struct ListNode**)malloc(sizeof(void*) * (m + skipB + 1));',
      'struct ListNode* headA = study_list(m, a); struct ListNode* p = headA; for (int i = 0; i < m; i++, p = p->next) nodes[i] = p;',
      'struct ListNode* shared = skipA < m ? nodes[skipA] : NULL; struct ListNode* headB = study_list(skipB, b); p = headB;',
      'for (int i = 0; i < skipB; i++, p = p->next) nodes[m + i] = p;',
      'if (skipB) nodes[m + skipB - 1]->next = shared; else headB = shared;',
      'clock_t start = clock();', 'struct ListNode* result = getIntersectionNode(headA, headB);', 'double ms = study_ms(start);',
      'for (int i = 0; i < m; i++) if (nodes[i]->val != a[i] || nodes[i]->next != (i + 1 < m ? nodes[i + 1] : NULL)) study_fail("The lists must keep their original structure.");',
      'for (int i = 0; i < skipB; i++) if (nodes[m + i]->val != b[i] || nodes[m + i]->next != (i + 1 < skipB ? nodes[m + i + 1] : shared)) study_fail("The lists must keep their original structure.");',
      'if (result && result != shared) study_fail("Return the first node shared by both lists.");',
      'if (result) study_int(result->val); else study_text("null");', 'study_finish("actual", ms);'
    ];
  }
  if (n === 374) return [`study_pick = ${input[1]};`, 'clock_t start = clock();', `int result = guessNumber(${input[0]});`, 'double ms = study_ms(start);', 'study_int(result);', 'study_finish("actual", ms);'];
  if (n === 1095) {
    const values = input[1] as number[];
    return [`MountainArray mountain = { ${flat('int', values, n)}, ${values.length}, 0 };`, 'clock_t start = clock();', `int result = findInMountainArray(${input[0]}, &mountain);`, 'double ms = study_ms(start);', 'study_int(result);', 'study_finish("actual", ms);'];
  }
  if (n === 133) return graphCase(input[0] as number[][]);
  if (n === 138) return randomListCase(input[0] as [number, number | null][]);
  // 235 passes p and q as values of nodes in root.
  const built = n === 235
    ? [build(m.params[0], input[0], 'p0', n), { setup: [`struct TreeNode* p1 = study_find(p0, ${input[1]});`], args: ['p1'] }, { setup: [`struct TreeNode* p2 = study_find(p0, ${input[2]});`], args: ['p2'] }]
    : m.params.map((p, i) => build(p, input[i], `p${i}`, n));
  lines.push(...built.flatMap(b => b.setup));
  lines.push('clock_t start = clock();', ...callReturning(m, `${m.name}(${args(built)})`, n), 'double ms = study_ms(start);');
  if (n === 26 || n === 27 || n === 80) lines.push(`if (result < 0 || result > p0Size) study_fail("Return the number of retained elements.");`, 'study_text("{\\"length\\":"); study_int(result); study_text(",\\"values\\":"); study_ints(p0, result); study_text("}");');
  else if (n === 143) lines.push('study_out_list(p0);');
  else if (n === 235) lines.push('if (!result || result != study_find(p0, result->val)) study_fail("Return an ancestor node from the input tree.");', 'study_int(result->val);');
  else if (n === 427) lines.push(`study_quad(result, ${(input[0] as Json[]).length});`);
  else if (m.returns === 'void') lines.push(write(m.params[0].type, 'p0', n === 88 ? 'p0Size' : undefined));
  else lines.push(write(m.returns, 'result', 'returnSize', 'returnColumnSizes', n));
  return [...lines, 'study_finish("actual", ms);'];
}

function graphCase(adjacency: number[][]): string[] {
  const n = adjacency.length;
  return [
    `int count = ${n}; const int* adjacency[] = {${adjacency.map(row => `(const int[]){${row.join(',') || '0'}}`).join(',') || 'NULL'}}; const int degree[] = {${adjacency.map(r => r.length).join(',') || '0'}};`,
    'struct Node** nodes = (struct Node**)malloc(sizeof(void*) * (count ? count : 1)); StudySet inputs = { 0 };',
    'for (int i = 0; i < count; i++) { nodes[i] = (struct Node*)malloc(sizeof(struct Node)); nodes[i]->val = i + 1; nodes[i]->numNeighbors = degree[i]; nodes[i]->neighbors = (struct Node**)malloc(sizeof(void*) * (degree[i] ? degree[i] : 1)); study_add(&inputs, nodes[i]); }',
    'for (int i = 0; i < count; i++) for (int j = 0; j < degree[i]; j++) nodes[i]->neighbors[j] = nodes[adjacency[i][j] - 1];',
    'clock_t start = clock();', 'struct Node* output = cloneGraph(count ? nodes[0] : NULL);', 'double ms = study_ms(start);',
    'struct Node** queue = (struct Node**)malloc(sizeof(void*) * 4096); int head = 0, tail = 0, cap = 4096; StudySet seen = { 0 };',
    'int** rows = (int**)calloc(count ? count : 1, sizeof(int*)); int* sizes = (int*)calloc(count ? count : 1, sizeof(int)); int highest = 0;',
    'if (output) queue[tail++] = output;',
    'while (head < tail) { struct Node* node = queue[head++]; if (study_has(&seen, node)) continue; if (study_has(&inputs, node)) study_fail("Return a deep copy, not an input node.");',
    '  if (seen.size > 1000 || node->val < 1 || node->val > count) study_fail("Invalid graph node."); study_add(&seen, node); if (rows[node->val - 1]) study_fail("Duplicate graph node value.");',
    '  if (node->numNeighbors < 0 || (node->numNeighbors && !node->neighbors)) study_fail("Invalid neighbors.");',
    '  int* values = (int*)malloc(sizeof(int) * (node->numNeighbors + 1)); for (int k = 0; k < node->numNeighbors; k++) values[k] = node->neighbors[k]->val;',
    '  for (int a = 1; a < node->numNeighbors; a++) for (int b = a; b > 0 && values[b - 1] > values[b]; b--) { int t = values[b]; values[b] = values[b - 1]; values[b - 1] = t; }',
    '  rows[node->val - 1] = values; sizes[node->val - 1] = node->numNeighbors; if (node->val > highest) highest = node->val;',
    '  for (int k = 0; k < node->numNeighbors; k++) { if (tail == cap) { cap *= 2; queue = (struct Node**)realloc(queue, sizeof(void*) * cap); } queue[tail++] = node->neighbors[k]; } }',
    'for (int i = 0; i < count; i++) { bool same = nodes[i]->val == i + 1 && nodes[i]->numNeighbors == degree[i]; for (int j = 0; same && j < degree[i]; j++) same = nodes[i]->neighbors[j] == nodes[adjacency[i][j] - 1]; if (!same) study_fail("The input graph was modified."); }',
    // Unvisited values are holes in the JavaScript array, and serialize as null.
    'study_text("["); for (int i = 0; i < highest; i++) { STUDY_SEP(i); if (rows[i]) study_ints(rows[i], sizes[i]); else study_text("null"); } study_text("]");',
    'study_finish("actual", ms);'
  ];
}
function randomListCase(pairs: [number, number | null][]): string[] {
  const n = pairs.length;
  return [
    `int count = ${n}; const int values[] = {${pairs.map(p => p[0]).join(',') || '0'}}; const int randoms[] = {${pairs.map(p => p[1] ?? -1).join(',') || '0'}};`,
    'struct Node** nodes = (struct Node**)malloc(sizeof(void*) * (count ? count : 1)); StudySet inputs = { 0 };',
    'for (int i = 0; i < count; i++) { nodes[i] = (struct Node*)malloc(sizeof(struct Node)); nodes[i]->val = values[i]; study_add(&inputs, nodes[i]); }',
    'for (int i = 0; i < count; i++) { nodes[i]->next = i + 1 < count ? nodes[i + 1] : NULL; nodes[i]->random = randoms[i] < 0 ? NULL : nodes[randoms[i]]; }',
    'clock_t start = clock();', 'struct Node* head = copyRandomList(count ? nodes[0] : NULL);', 'double ms = study_ms(start);',
    'StudySet seen = { 0 }; int size = 0, cap = 64; struct Node** out = (struct Node**)malloc(sizeof(void*) * cap);',
    'for (; head; head = head->next) { if (study_has(&seen, head) || size > 10000) study_fail("Invalid output list."); if (study_has(&inputs, head)) study_fail("Return a deep copy, not an input node."); study_add(&seen, head); if (size == cap) { cap *= 2; out = (struct Node**)realloc(out, sizeof(void*) * cap); } out[size++] = head; }',
    'for (int i = 0; i < count; i++) if (nodes[i]->val != values[i] || nodes[i]->next != (i + 1 < count ? nodes[i + 1] : NULL) || nodes[i]->random != (randoms[i] < 0 ? NULL : nodes[randoms[i]])) study_fail("The input list was modified.");',
    'study_text("["); for (int i = 0; i < size; i++) { STUDY_SEP(i); study_text("["); study_int(out[i]->val); study_text(","); if (!out[i]->random) study_text("null"); else { if (!study_has(&seen, out[i]->random)) study_fail("random must point into the copied list."); int at = 0; while (out[at] != out[i]->random) at++; study_int(at); } study_text("]"); } study_text("]");',
    'study_finish("actual", ms);'
  ];
}

function codecCase(problem: CodingProblem, input: Json[]): string[] {
  if (problem.number === 297) {
    const v = input[0] as (number | null)[];
    return [
      `struct TreeNode* root = study_tree(${v.length}, (const int[]){${v.map(x => x ?? 0).join(',') || '0'}}, (const bool[]){${v.map(x => x === null ? 'false' : 'true').join(',') || 'false'}});`,
      'clock_t start = clock();', 'char* text = serialize(root);', 'if (!text) study_fail("serialize must return a string.");',
      'struct TreeNode* copy = deserialize(text);', 'double ms = study_ms(start);', 'study_out_tree(copy);', 'study_finish("actual", ms);'
    ];
  }
  if (problem.number === 535) return [
    `char* url = study_dup(${cString(input[0] as string)});`,
    'clock_t start = clock();', 'char* shortUrl = encode(url);', 'if (!shortUrl) study_fail("encode must return a string.");',
    'char* decoded = decode(shortUrl);', 'double ms = study_ms(start);', 'study_str(decoded);', 'study_finish("actual", ms);'
  ];
  const strs = input[0] as string[];
  return [
    `int count = ${strs.length}; char** strs = ${flat('String', strs, 271)};`,
    'clock_t start = clock();', 'char* encoded = encode(strs, count);', 'if (!encoded) study_fail("encode must return a string.");',
    'int returnSize = -1; char** decoded = decode(encoded, &returnSize);', 'double ms = study_ms(start);', 'study_strs(decoded, returnSize);', 'study_finish("actual", ms);'
  ];
}

function designCase(problem: CodingProblem, c: Extract<ReturnType<typeof contract>, { kind: 'design' }>, input: Json[]): string[] {
  const [ops, values] = input as [string[], Json[][]];
  const lines: string[] = [], name = c.name;
  const ctor = c.constructor.map((p, i) => build(p, values[0][i], `c${i}`, problem.number));
  lines.push(...ctor.flatMap(b => b.setup), 'clock_t start = clock();', `${name}* obj = ${cDesignFunction(name, 'create')}(${args(ctor)});`, 'study_text("[null");');
  for (let i = 1; i < ops.length; i++) {
    const m = c.methods.find(x => x.name === ops[i])!;
    const built = m.params.map((p, k) => build(p, values[i][k], `a${i}_${k}`, problem.number));
    const call = `${cDesignFunction(name, m.name)}(obj${built.length ? ', ' + args(built) : ''})`;
    lines.push('{', ...built.flatMap(b => b.setup), ...callReturning(m, call, problem.number), 'study_text(",");', m.returns === 'void' ? 'study_text("null");' : write(m.returns, 'result', 'returnSize', 'returnColumnSizes'), '}');
  }
  lines.push(`${cDesignFunction(name, 'free')}(obj);`, 'double ms = study_ms(start);', 'study_text("]");', 'study_finish("actual", ms);');
  return lines;
}

const API_DEFINITIONS: Record<number, string> = {
  374: 'static int study_pick;\nint guess(int num) { return num == study_pick ? 0 : num < study_pick ? 1 : -1; }\n',
  1095: 'struct MountainArray { int* values; int n; int calls; };\nint get(MountainArray* m, int index) { if (++m->calls > 100) study_fail("MountainArray.get exceeded 100 calls."); if (index < 0 || index >= m->n) study_fail("MountainArray index out of range."); return m->values[index]; }\nint length(MountainArray* m) { return m->n; }\n',
  427: String.raw`static void study_fill(struct Node* node, int r, int c, int n, int** grid, StudySet* seen) {
  if (!node || !study_add(seen, node) || n < 1) study_fail("Invalid quad tree.");
  if (node->isLeaf) { for (int i = r; i < r + n; i++) for (int j = c; j < c + n; j++) grid[i][j] = node->val ? 1 : 0; return; }
  study_fill(node->topLeft, r, c, n / 2, grid, seen); study_fill(node->topRight, r, c + n / 2, n / 2, grid, seen);
  study_fill(node->bottomLeft, r + n / 2, c, n / 2, grid, seen); study_fill(node->bottomRight, r + n / 2, c + n / 2, n / 2, grid, seen);
}
static void study_quad(struct Node* root, int size) {
  int** grid = (int**)malloc(sizeof(int*) * (size ? size : 1)); int* cols = (int*)malloc(sizeof(int) * (size ? size : 1)); StudySet seen = { 0 };
  for (int i = 0; i < size; i++) { grid[i] = (int*)calloc(size ? size : 1, sizeof(int)); cols[i] = size; }
  study_fill(root, 0, 0, size, grid, &seen); study_ints2(grid, size, cols);
}
`
};

export function cProgram(problem: CodingProblem, source: string, cases: Json[][]): string {
  const c = contract(problem.number), n = problem.number;
  const bodies = cases.map((input, i) => {
    const body = c.kind === 'function' ? functionCase(problem, c.method, input) : c.kind === 'codec' ? codecCase(problem, input) : designCase(problem, c, input);
    return `static void study_case_${i}(void) {\n  ${body.join('\n  ')}\n}`;
  });
  return [
    PRELUDE, NODES[n] ?? '', API[n] ?? '',
    '#line 1 "solution.c"', source, '',
    '#line 1 "harness.c"', RUNTIME, API_DEFINITIONS[n] ?? '',
    ...bodies,
    'int main(int argc, char** argv) {',
    '  setvbuf(stdout, NULL, _IONBF, 0); setvbuf(stderr, NULL, _IONBF, 0);',
    '  if (argc < 3) return 64;',
    '  study_result_path = argv[2];',
    '  switch (atoi(argv[1])) {',
    ...cases.map((_, i) => `    case ${i}: study_case_${i}(); break;`),
    '    default: return 64;',
    '  }',
    '  return 0;',
    '}', ''
  ].join('\n');
}
