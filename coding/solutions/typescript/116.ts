function connect(root: _Node | null): _Node | null {
  let leftmost = root;
  while (leftmost && leftmost.left) {
    for (let node: _Node | null = leftmost; node; node = node.next) {
      node.left!.next = node.right;
      if (node.next) {
        node.right!.next = node.next.left;
      }
    }
    leftmost = leftmost.left;
  }
  return root;
}
