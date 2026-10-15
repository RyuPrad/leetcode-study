function assignTasks(servers: number[], tasks: number[]): number[] {
  const free = new Heap<number[]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]));
  const busy = new Heap<number[]>((a, b) => a[0] < b[0]);
  for (let i = 0; i < servers.length; i++) {
    free.push([servers[i], i]);
  }
  const res: number[] = [];
  let time = 0;
  for (let j = 0; j < tasks.length; j++) {
    time = Math.max(time, j);
    if (!free.size()) {
      time = busy.peek()[0];
    }
    while (busy.size() && busy.peek()[0] <= time) {
      const [, weight, index] = busy.pop();
      free.push([weight, index]);
    }
    const [weight, index] = free.pop();
    res.push(index);
    busy.push([time + tasks[j], weight, index]);
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
