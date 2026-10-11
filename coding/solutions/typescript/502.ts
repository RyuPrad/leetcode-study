function findMaximizedCapital(k: number, w: number, profits: number[], capital: number[]): number {
  const projects = profits.map((p, idx) => [capital[idx], p]);
  projects.sort((a, b) => a[0] - b[0]);
  const maxHeap = new Heap<number>((a, b) => a > b); // by profit
  let i = 0;
  for (let j = 0; j < k; j++) {
    while (i < projects.length && projects[i][0] <= w) {
      maxHeap.push(projects[i][1]); i++;
    }
    if (maxHeap.size() === 0) break;
    w += maxHeap.pop();
  }
  return w;
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
