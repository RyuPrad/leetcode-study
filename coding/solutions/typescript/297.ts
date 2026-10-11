function serialize(root: TreeNode | null): string {
  const res: string[] = [];
  function dfs(node: TreeNode | null): void {
    if (!node) { res.push("null"); return; }
    res.push(String(node.val));
    dfs(node.left);
    dfs(node.right);
  }
  dfs(root);
  return res.join(",");
}

function deserialize(data: string): TreeNode | null {
  const vals = data.split(",");
  let i = 0;
  function dfs(): TreeNode | null {
    if (vals[i] === "null") { i++; return null; }
    const node = new TreeNode(Number(vals[i]));
    i++;
    node.left = dfs();
    node.right = dfs();
    return node;
  }
  return dfs();
}
