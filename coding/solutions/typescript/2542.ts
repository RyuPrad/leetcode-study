function maxScore(nums1: number[], nums2: number[], k: number): number {
  const pairs = nums1.map((a, i) => [a, nums2[i]]).sort((x, y) => y[1] - x[1]);
  const heap = new Heap<number>((a, b) => a < b);
  let sum = 0, res = 0;
  for (const [a, b] of pairs) {
    heap.push(a);
    sum += a;
    if (heap.size() > k) {
      sum -= heap.pop();
    }
    if (heap.size() === k) {
      res = Math.max(res, sum * b);
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
