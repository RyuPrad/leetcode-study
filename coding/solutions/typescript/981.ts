class TimeMap {
  private store = new Map<string, [number, string][]>();

  set(key: string, value: string, timestamp: number): void {
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }
    this.store.get(key)!.push([timestamp, value]);
  }

  get(key: string, timestamp: number): string {
    const arr = this.store.get(key) || [];
    let left = 0;
    let right = arr.length - 1;
    let res = "";
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid][0] <= timestamp) {
        res = arr[mid][1];
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return res;
  }
}
