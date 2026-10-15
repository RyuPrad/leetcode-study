function isPalindrome(head: ListNode | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  let prev: ListNode | null = null;
  while (slow) {
    const next: ListNode | null = slow.next;
    slow.next = prev;
    prev = slow;
    slow = next;
  }
  let left = head, right = prev;
  while (right) {
    if (left!.val !== right.val) {
      return false;
    }
    left = left!.next;
    right = right.next;
  }
  return true;
}
