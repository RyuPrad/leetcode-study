function maxProbability(n: number, edges: number[][], succProb: number[], start_node: number, end_node: number): number {
  const adj: [number, number][][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i];
    adj[a].push([b, succProb[i]]);
    adj[b].push([a, succProb[i]]);
  }
  const best: number[] = new Array(n).fill(0);
  best[start_node] = 1;
  const heap = new Heap<[number, number]>((x, y) => x[0] > y[0]);
  heap.push([1, start_node]);
  while (heap.size()) {
    const [prob, node] = heap.pop();
    if (node === end_node) {
      return prob;
    }
    if (prob < best[node]) {
      continue;
    }
    for (const [next, edgeProb] of adj[node]) {
      const candidate = prob * edgeProb;
      if (candidate > best[next]) {
        best[next] = candidate;
        heap.push([candidate, next]);
      }
    }
  }
  return 0;
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
