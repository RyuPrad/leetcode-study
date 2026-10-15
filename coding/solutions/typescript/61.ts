function rotateRight(head: ListNode | null, k: number): ListNode | null {
  if (!head) {
    return head;
  }
  let length = 1, tail = head;
  while (tail.next) {
    tail = tail.next;
    length++;
  }
  k %= length;
  if (k === 0) {
    return head;
  }
  let newTail = head;
  for (let i = 1; i < length - k; i++) {
    newTail = newTail.next!;
  }
  const newHead = newTail.next;
  newTail.next = null;
  tail.next = head;
  return newHead;
}
