function longestDiverseString(a: number, b: number, c: number): string {
  // Larger count first; ties go to the larger letter, like comparing [count, letter] arrays.
  const heap = new Heap<[number, string]>((x, y) => x[0] !== y[0] ? x[0] > y[0] : x[1] > y[1]);
  if (a > 0) heap.push([a, 'a']);
  if (b > 0) heap.push([b, 'b']);
  if (c > 0) heap.push([c, 'c']);
  let res = "";
  while (heap.size()) {
    const [cnt, ch] = heap.pop();
    if (res.length >= 2 && res[res.length - 1] === ch && res[res.length - 2] === ch) {
      if (heap.size() === 0) break;
      const [cnt2, ch2] = heap.pop();
      res += ch2;
      if (cnt2 - 1 > 0) heap.push([cnt2 - 1, ch2]);
      heap.push([cnt, ch]);
    } else {
      res += ch;
      if (cnt - 1 > 0) heap.push([cnt - 1, ch]);
    }
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
