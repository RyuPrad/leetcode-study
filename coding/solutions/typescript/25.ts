function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let groupPrev: ListNode = dummy;
  while (true) {
    let kth: ListNode | null = groupPrev;
    for (let i = 0; i < k; i++) {
      kth = kth!.next;
      if (!kth) return dummy.next;
    }
    const groupNext: ListNode | null = kth!.next;
    let prev: ListNode | null = groupNext;
    let curr: ListNode | null = groupPrev.next;
    while (curr !== groupNext) {
      const next: ListNode | null = curr!.next;
      curr!.next = prev;
      prev = curr;
      curr = next;
    }
    const temp: ListNode = groupPrev.next!;
    groupPrev.next = kth;
    groupPrev = temp;
  }
}
