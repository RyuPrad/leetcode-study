function minInterval(intervals: number[][], queries: number[]): number[] {
  intervals.sort((a, b) => a[0] - b[0]);
  const sortedQueries = queries.map((q, idx) => [q, idx]).sort((a, b) => a[0] - b[0]);
  const res: number[] = new Array(queries.length).fill(-1);
  // Smallest interval size first; entries are [size, right end].
  const heap = new Heap<[number, number]>((a, b) => a[0] < b[0]);
  let i = 0;
  for (const [q, idx] of sortedQueries) {
    while (i < intervals.length && intervals[i][0] <= q) {
      const l = intervals[i][0], r = intervals[i][1];
      heap.push([r - l + 1, r]);
      i++;
    }
    while (heap.size() > 0 && heap.peek()[1] < q) {
      heap.pop();
    }
    res[idx] = heap.size() > 0 ? heap.peek()[0] : -1;
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
