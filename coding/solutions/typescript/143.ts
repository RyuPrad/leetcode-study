function reorderList(head: ListNode | null): void {
  if (!head || !head.next) return;
  let slow: ListNode = head;
  let fast: ListNode = head;
  while (fast.next && fast.next.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  let second: ListNode | null = slow.next;
  slow.next = null;

  let prev: ListNode | null = null;
  let curr: ListNode | null = second;
  while (curr) {
    const next: ListNode | null = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  let first: ListNode | null = head;
  second = prev;
  while (second) {
    const temp1: ListNode | null = first!.next;
    const temp2: ListNode | null = second.next;
    first!.next = second;
    second.next = temp1;
    first = temp1;
    second = temp2;
  }
}
