function swapNodes(head: ListNode | null, k: number): ListNode | null {
  let fast = head!;
  for (let i = 1; i < k; i++) {
    fast = fast.next!;
  }
  const first = fast;
  let slow = head!;
  while (fast.next) {
    slow = slow.next!;
    fast = fast.next;
  }
  [first.val, slow.val] = [slow.val, first.val];
  return head;
}
