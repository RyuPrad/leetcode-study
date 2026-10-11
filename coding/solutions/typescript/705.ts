class MyHashSet {
  private size = 8;
  private buckets: number[][] = Array.from({ length: this.size }, () => []);

  private hash(key: number): number {
    return key % this.size;
  }

  add(key: number): void {
    const idx = this.hash(key);
    if (!this.buckets[idx].includes(key)) {
      this.buckets[idx].push(key);
    }
  }

  remove(key: number): void {
    const idx = this.hash(key);
    this.buckets[idx] = this.buckets[idx].filter(k => k !== key);
  }

  contains(key: number): boolean {
    const idx = this.hash(key);
    return this.buckets[idx].includes(key);
  }
}
