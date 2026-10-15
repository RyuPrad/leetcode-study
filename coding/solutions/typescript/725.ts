function splitListToParts(head: ListNode | null, k: number): Array<ListNode | null> {
  let length = 0;
  for (let node = head; node; node = node.next) {
    length++;
  }
  const size = Math.floor(length / k), extra = length % k;
  const res: Array<ListNode | null> = new Array(k).fill(null);
  let curr = head;
  for (let i = 0; i < k && curr; i++) {
    res[i] = curr;
    const partSize = size + (i < extra ? 1 : 0);
    for (let j = 1; j < partSize; j++) {
      curr = curr!.next;
    }
    const next: ListNode | null = curr!.next;
    curr!.next = null;
    curr = next;
  }
  return res;
}
