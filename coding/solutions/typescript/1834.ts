function getOrder(tasks: number[][]): number[] {
  const indexed = tasks.map((t, i) => [t[0], t[1], i]);
  indexed.sort((a, b) => a[0] - b[0]);
  // Shortest processing time first, then lowest index.
  const heap = new Heap<[number, number]>((a, b) => a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1]);
  const res: number[] = [];
  let time = 0, i = 0;
  while (res.length < tasks.length) {
    while (i < indexed.length && indexed[i][0] <= time) {
      heap.push([indexed[i][1], indexed[i][2]]);
      i++;
    }
    if (heap.size() === 0) {
      time = indexed[i][0];
      continue;
    }
    const [proc, idx] = heap.pop();
    time += proc;
    res.push(idx);
  }
  return res;
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
