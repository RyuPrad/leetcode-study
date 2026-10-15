class MyLinkedList {
  dummy: ListNode;
  size: number;

  constructor() {
    this.dummy = new ListNode(0);
    this.size = 0;
  }

  get(index: number): number {
    if (index < 0 || index >= this.size) {
      return -1;
    }
    let curr = this.dummy.next!;
    for (let i = 0; i < index; i++) {
      curr = curr.next!;
    }
    return curr.val;
  }

  addAtHead(val: number): void {
    this.addAtIndex(0, val);
  }

  addAtTail(val: number): void {
    this.addAtIndex(this.size, val);
  }

  addAtIndex(index: number, val: number): void {
    if (index > this.size) {
      return;
    }
    let prev = this.dummy;
    for (let i = 0; i < index; i++) {
      prev = prev.next!;
    }
    prev.next = new ListNode(val, prev.next);
    this.size++;
  }

  deleteAtIndex(index: number): void {
    if (index < 0 || index >= this.size) {
      return;
    }
    let prev = this.dummy;
    for (let i = 0; i < index; i++) {
      prev = prev.next!;
    }
    prev.next = prev.next!.next;
    this.size--;
  }
}
