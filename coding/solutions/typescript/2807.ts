function insertGreatestCommonDivisors(head: ListNode | null): ListNode | null {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  let curr = head!;
  while (curr.next !== null) {
    const node = new ListNode(gcd(curr.val, curr.next.val));
    node.next = curr.next;
    curr.next = node;
    curr = node.next;
  }
  return head;
}
