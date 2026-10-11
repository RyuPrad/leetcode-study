function minCostConnectPoints(points: number[][]): number {
  const n = points.length;
  const inMST: boolean[] = new Array(n).fill(false);
  const heap = new Heap<[number, number]>((a, b) => a[0] < b[0]);
  heap.push([0, 0]);
  let total = 0, count = 0;
  while (heap.size() > 0 && count < n) {
    const [cost, i] = heap.pop();
    if (inMST[i]) continue;
    inMST[i] = true;
    total += cost;
    count++;
    for (let j = 0; j < n; j++) {
      if (!inMST[j]) {
        const d = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
        heap.push([d, j]);
      }
    }
  }
  return total;
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
