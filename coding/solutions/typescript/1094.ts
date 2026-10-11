function carPooling(trips: number[][], capacity: number): boolean {
  trips.sort((a, b) => a[1] - b[1]);
  // Ordered by drop-off point, then passenger count, like comparing [end, num] arrays.
  const heap = new Heap<[number, number]>((a, b) => a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1]);
  let cur = 0;
  for (const [num, start, end] of trips) {
    while (heap.size() && heap.peek()[0] <= start) {
      cur -= heap.pop()[1];
    }
    cur += num;
    if (cur > capacity) return false;
    heap.push([end, num]);
  }
  return true;
}

class Heap<T> {
  private items: T[] = [];

  constructor(private before: (a: T, b: T) => boolean) {}

  size(): number {
    return this.items.length;
  }

  peek(): T {
    return this.items[0];
  }

  push(value: T): void {
    const items = this.items;
    items.push(value);
    for (let i = items.length - 1; i > 0;) {
      const parent = (i - 1) >> 1;
      if (!this.before(items[i], items[parent])) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }

  pop(): T {
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
