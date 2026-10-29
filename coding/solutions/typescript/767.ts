function reorganizeString(s: string): string {
  const freq = new Map<string, number>();
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
  // Larger count first; ties go to the larger character.
  const heap = new Heap<[number, string]>((a, b) => a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1]);
  for (const c of freq.keys()) heap.push([freq.get(c)!, c]);
  let res = "";
  let prev: [number, string] | null = null;
  while (heap.size()) {
    const [cnt, ch] = heap.pop();
    res += ch;
    if (prev && prev[0] > 0) heap.push(prev);
    prev = [cnt - 1, ch];
  }
  return res.length === s.length ? res : "";
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
