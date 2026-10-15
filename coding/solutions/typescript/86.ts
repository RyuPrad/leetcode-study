function partition(head: ListNode | null, x: number): ListNode | null {
  const lessHead = new ListNode(0), moreHead = new ListNode(0);
  let less = lessHead, more = moreHead;
  while (head) {
    if (head.val < x) {
      less.next = head;
      less = head;
    } else {
      more.next = head;
      more = head;
    }
    head = head.next;
  }
  more.next = null;
  less.next = moreHead.next;
  return lessHead.next;
}
