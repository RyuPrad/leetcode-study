function cloneGraph(node: _Node | null): _Node | null {
  if (node === null) return null;
  const visited = new Map<_Node, _Node>();
  const dfs = (curr: _Node): _Node => {
    if (visited.has(curr)) return visited.get(curr)!;
    const copy = new _Node(curr.val);
    visited.set(curr, copy);
    for (const nei of curr.neighbors) {
      copy.neighbors.push(dfs(nei));
    }
    return copy;
  };
  return dfs(node);
}
