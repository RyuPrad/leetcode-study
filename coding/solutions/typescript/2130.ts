function pairSum(head: ListNode | null): number {
  let slow = head, fast = head, prev: ListNode | null = null;
  while (fast) {
    fast = fast.next!.next;
    const next: ListNode | null = slow!.next;
    slow!.next = prev;
    prev = slow;
    slow = next;
  }
  let res = 0;
  while (slow) {
    res = Math.max(res, prev!.val + slow.val);
    prev = prev!.next;
    slow = slow.next;
  }
  return res;
}
