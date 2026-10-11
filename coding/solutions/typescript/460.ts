class LFUCache {
  private capacity: number;
  private keyToVal = new Map<number, number>();
  private keyToFreq = new Map<number, number>();
  private freqToKeys = new Map<number, Set<number>>();
  private minFreq = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    if (!this.keyToVal.has(key)) return -1;
    this.touch(key);
    return this.keyToVal.get(key)!;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;
    if (this.keyToVal.has(key)) {
      this.keyToVal.set(key, value);
      this.touch(key);
      return;
    }
    if (this.keyToVal.size >= this.capacity) {
      const keys = this.freqToKeys.get(this.minFreq)!;
      const evict = keys.values().next().value!;
      keys.delete(evict);
      this.keyToVal.delete(evict);
      this.keyToFreq.delete(evict);
    }
    this.keyToVal.set(key, value);
    this.keyToFreq.set(key, 1);
    if (!this.freqToKeys.has(1)) this.freqToKeys.set(1, new Set());
    this.freqToKeys.get(1)!.add(key);
    this.minFreq = 1;
  }

  private touch(key: number): void {
    const f = this.keyToFreq.get(key)!;
    this.keyToFreq.set(key, f + 1);
    this.freqToKeys.get(f)!.delete(key);
    if (this.freqToKeys.get(f)!.size === 0) {
      this.freqToKeys.delete(f);
      if (this.minFreq === f) this.minFreq++;
    }
    if (!this.freqToKeys.has(f + 1)) this.freqToKeys.set(f + 1, new Set());
    this.freqToKeys.get(f + 1)!.add(key);
  }
}
