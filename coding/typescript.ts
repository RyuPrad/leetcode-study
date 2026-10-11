// TypeScript solutions run in the same QuickJS sandbox as JavaScript after their types are
// removed. TypeScript 7 has no JavaScript compiler API, and @babel/core needs Node's path
// module, so types are stripped here with the parser/traverse/generator the debugger
// already bundles. Removal keeps every runtime node's original location, so Run errors and
// debugger sites stay on the user's TypeScript lines. Type errors are advisory (the editor
// reports them); only syntax errors and unsupported constructs stop a run.
import { parse } from '@babel/parser';
import traverseImport, { type NodePath } from '@babel/traverse';
import generateImport from '@babel/generator';
import * as t from '@babel/types';
const traverse = (traverseImport as any).default || traverseImport;
const generate = (generateImport as any).default || generateImport;

export class TypeScriptSyntaxError extends Error { override name = 'SyntaxError'; }
const unsupported = (path: NodePath, what: string): never => {
  throw new TypeScriptSyntaxError(`${what} is not supported in local TypeScript solutions (line ${path.node.loc?.start.line ?? 1}).`);
};

export function parseTypeScript(source: string): t.File {
  try { return parse(source, { sourceType: 'script', plugins: ['typescript'] }); }
  catch (error) { throw new TypeScriptSyntaxError(String((error as Error).message ?? error).slice(0, 2000)); }
}

// enum E { A, B = 5, C = 'c' } -> var E = (E => { E[E["A"] = 0] = "A"; ...; return E; })({});
function enumDeclaration(path: NodePath<t.TSEnumDeclaration>): t.VariableDeclaration {
  if (path.node.declare) unsupported(path, 'declare enum');
  const name = path.node.id, body: t.Statement[] = [];
  let next: number | undefined = 0;
  // @babel/types 7 lists members directly; Babel 8 moves them into body.
  const members: t.TSEnumMember[] = (path.node as any).members ?? (path.node as any).body.members;
  for (const member of members) {
    const key = t.isIdentifier(member.id) ? member.id.name : member.id.value;
    let value: t.Expression;
    const init = member.initializer;
    if (!init) { if (next === undefined) unsupported(path, 'An enum member after a string member without an initializer'); value = t.numericLiteral(next!); next! += 1; }
    else if (t.isNumericLiteral(init)) { value = init; next = init.value + 1; }
    else if (t.isUnaryExpression(init, { operator: '-' }) && t.isNumericLiteral(init.argument)) { value = init; next = -init.argument.value + 1; }
    else if (t.isStringLiteral(init)) { value = init; next = undefined; }
    else return unsupported(path, 'A computed enum member');
    const assign = t.assignmentExpression('=', t.memberExpression(t.cloneNode(name), t.stringLiteral(key), true), value);
    body.push(t.expressionStatement(t.isStringLiteral(value) ? assign
      : t.assignmentExpression('=', t.memberExpression(t.cloneNode(name), assign, true), t.stringLiteral(key))));
  }
  body.push(t.returnStatement(t.cloneNode(name)));
  const declaration = t.variableDeclaration('var', [t.variableDeclarator(t.cloneNode(name),
    t.callExpression(t.arrowFunctionExpression([t.cloneNode(name)], t.blockStatement(body)), [t.objectExpression([])]))]);
  declaration.loc = path.node.loc;
  return declaration;
}

// constructor(private readonly size: number) {} -> constructor(size) { this.size = size; }
function parameterProperties(path: NodePath<t.ClassMethod>) {
  const assignments: t.Statement[] = [];
  path.node.params = path.node.params.map(param => {
    if (!t.isTSParameterProperty(param)) return param;
    const inner = param.parameter, id = t.isAssignmentPattern(inner) ? inner.left : inner;
    if (!t.isIdentifier(id)) return unsupported(path, 'A destructured parameter property');
    const statement = t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.thisExpression(), t.identifier(id.name)), t.identifier(id.name)));
    statement.loc = param.loc;
    assignments.push(statement);
    return inner;
  });
  if (!assignments.length) return;
  const body = path.node.body.body;
  // Fields may only be assigned after super() in a derived class.
  const afterSuper = body.findIndex(s => t.isExpressionStatement(s) && t.isCallExpression(s.expression) && t.isSuper(s.expression.callee)) + 1;
  body.splice(afterSuper, 0, ...assignments);
}

const clearMember = (node: any) => { node.accessibility = null; node.readonly = false; node.optional = false; node.definite = false; node.override = false; node.abstract = false; node.typeAnnotation = null; };

/** Removes types from a parsed TypeScript AST in place. Node locations still refer to the TypeScript source. */
export function stripTypesFromAst(ast: t.File): t.File {
  traverse(ast, {
    'TSInterfaceDeclaration|TSTypeAliasDeclaration|TSDeclareFunction|TSDeclareMethod|TSIndexSignature'(path: NodePath) { path.remove(); },
    'TSTypeAnnotation|TSTypeParameterDeclaration|TSTypeParameterInstantiation'(path: NodePath) { path.remove(); },
    'TSAsExpression|TSSatisfiesExpression|TSNonNullExpression|TSTypeAssertion|TSInstantiationExpression'(path: NodePath<any>) { path.replaceWith(path.node.expression); },
    TSEnumDeclaration(path: NodePath<t.TSEnumDeclaration>) { path.replaceWith(enumDeclaration(path)); },
    TSModuleDeclaration(path: NodePath<t.TSModuleDeclaration>) { if (path.node.declare) path.remove(); else unsupported(path, 'A namespace'); },
    'TSImportEqualsDeclaration|TSExportAssignment|TSNamespaceExportDeclaration'(path: NodePath) { unsupported(path, 'A module declaration'); },
    VariableDeclaration(path: NodePath<t.VariableDeclaration>) { if (path.node.declare) path.remove(); },
    VariableDeclarator(path: NodePath<t.VariableDeclarator>) { path.node.definite = false; },
    Identifier(path: NodePath<t.Identifier>) { path.node.optional = false; },
    Pattern(path: NodePath<any>) { if ('optional' in path.node) path.node.optional = false; },
    Class(path: NodePath<t.Class>) {
      if (t.isClassDeclaration(path.node) && path.node.declare) { path.remove(); return; }
      (path.node as any).abstract = false; path.node.implements = null; path.node.superTypeParameters = null;
    },
    'ClassProperty|ClassPrivateProperty|ClassAccessorProperty'(path: NodePath<any>) {
      if (path.node.declare || path.node.abstract) { path.remove(); return; }
      clearMember(path.node);
    },
    'ClassMethod|ClassPrivateMethod'(path: NodePath<any>) {
      if (path.node.abstract) { path.remove(); return; }
      if (path.node.kind === 'constructor') parameterProperties(path);
      clearMember(path.node);
    },
    Function(path: NodePath<t.Function>) {
      // A leading `this: T` parameter only types the receiver.
      const first = path.node.params[0];
      if (t.isIdentifier(first) && first.name === 'this') path.node.params.shift();
    }
  });
  // Anything typed that is still present would reach QuickJS as a syntax error later.
  traverse(ast, { enter(path: NodePath) { if (path.node.type.startsWith('TS')) unsupported(path, `TypeScript syntax ${path.node.type}`); } });
  return ast;
}

/** JavaScript for Run/Submit. retainLines keeps runtime error line numbers on the user's lines. */
export function stripTypes(source: string): string {
  return generate(stripTypesFromAst(parseTypeScript(source)), { retainLines: true, comments: true }, source).code;
}
