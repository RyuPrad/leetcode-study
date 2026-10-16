class BSTIterator {
  stack: TreeNode[];

  constructor(root: TreeNode | null) {
    this.stack = [];
    this.pushLeft(root);
  }

  pushLeft(node: TreeNode | null): void {
    while (node) {
      this.stack.push(node);
      node = node.left;
    }
  }

  next(): number {
    const node = this.stack.pop()!;
    this.pushLeft(node.right);
    return node.val;
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }
}
