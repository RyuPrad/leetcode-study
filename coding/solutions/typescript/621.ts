function leastInterval(tasks: string[], n: number): number {
  const freq = new Map<string, number>();
  for (const t of tasks) freq.set(t, (freq.get(t) || 0) + 1);
  const heap = new Heap<number>((a, b) => a > b);
  for (const key of freq.keys()) heap.push(freq.get(key)!);
  let time = 0;
  const queue: [number, number][] = [];
  while (heap.size() || queue.length) {
    time++;
    if (heap.size()) {
      const cnt = heap.pop() - 1;
      if (cnt > 0) queue.push([cnt, time + n]);
    }
    if (queue.length && queue[0][1] === time) {
      heap.push(queue.shift()![0]);
    }
  }
  return time;
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
