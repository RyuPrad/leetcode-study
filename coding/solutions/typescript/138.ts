function copyRandomList(head: _Node | null): _Node | null {
  if (!head) return null;
  const map = new Map<_Node, _Node>();
  let curr: _Node | null = head;
  while (curr) {
    map.set(curr, new _Node(curr.val));
    curr = curr.next;
  }
  curr = head;
  while (curr) {
    map.get(curr)!.next = curr.next ? map.get(curr.next)! : null;
    map.get(curr)!.random = curr.random ? map.get(curr.random)! : null;
    curr = curr.next;
  }
  return map.get(head)!;
}
