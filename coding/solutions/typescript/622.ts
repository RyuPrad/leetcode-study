class MyCircularQueue {
  private queue: number[];
  private head = 0;
  private count = 0;
  private capacity: number;

  constructor(k: number) {
    this.queue = new Array(k).fill(0);
    this.capacity = k;
  }

  enQueue(value: number): boolean {
    if (this.isFull()) return false;
    this.queue[(this.head + this.count) % this.capacity] = value;
    this.count++;
    return true;
  }

  deQueue(): boolean {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return true;
  }

  Front(): number {
    return this.isEmpty() ? -1 : this.queue[this.head];
  }

  Rear(): number {
    return this.isEmpty() ? -1 : this.queue[(this.head + this.count - 1) % this.capacity];
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  isFull(): boolean {
    return this.count === this.capacity;
  }
}
