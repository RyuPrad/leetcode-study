class MyHashMap {
  private size = 8;
  private buckets: [number, number][][] = Array.from({ length: this.size }, () => []);

  private hash(key: number): number {
    return key % this.size;
  }

  put(key: number, value: number): void {
    const idx = this.hash(key);
    for (const pair of this.buckets[idx]) {
      if (pair[0] === key) {
        pair[1] = value;
        return;
      }
    }
    this.buckets[idx].push([key, value]);
  }

  get(key: number): number {
    const idx = this.hash(key);
    for (const pair of this.buckets[idx]) {
      if (pair[0] === key) return pair[1];
    }
    return -1;
  }

  remove(key: number): void {
    const idx = this.hash(key);
    this.buckets[idx] = this.buckets[idx].filter(pair => pair[0] !== key);
  }
}
