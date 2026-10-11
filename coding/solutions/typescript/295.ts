class MedianFinder {
  private small = new Heap((a, b) => a > b); // lower half, largest on top
  private large = new Heap((a, b) => a < b); // upper half, smallest on top

  addNum(num: number): void {
    this.small.push(num);
    if (this.small.size() && this.large.size() &&
        this.small.peek() > this.large.peek()) {
      this.large.push(this.small.pop());
    }
    if (this.small.size() > this.large.size() + 1) {
      this.large.push(this.small.pop());
    }
    if (this.large.size() > this.small.size() + 1) {
      this.small.push(this.large.pop());
    }
  }

  findMedian(): number {
    if (this.small.size() > this.large.size()) return this.small.peek();
    if (this.large.size() > this.small.size()) return this.large.peek();
    return (this.small.peek() + this.large.peek()) / 2;
  }
}

class Heap {
  private items: number[] = [];

  constructor(private before: (a: number, b: number) => boolean) {}

  size(): number {
    return this.items.length;
  }

  peek(): number {
    return this.items[0];
  }

  push(value: number): void {
    const items = this.items;
    items.push(value);
    for (let i = items.length - 1; i > 0;) {
      const parent = (i - 1) >> 1;
      if (!this.before(items[i], items[parent])) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }

  pop(): number {
    const items = this.items, top = items[0], last = items.pop()!;
    if (items.length) {
      items[0] = last;
      for (let i = 0; ;) {
        const left = 2 * i + 1, right = left + 1;
        let best = i;
        if (left < items.length && this.before(items[left], items[best])) best = left;
        if (right < items.length && this.before(items[right], items[best])) best = right;
        if (best === i) break;
        [items[best], items[i]] = [items[i], items[best]];
        i = best;
      }
    }
    return top;
  }
}
