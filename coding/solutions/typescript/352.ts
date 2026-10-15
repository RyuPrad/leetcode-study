class SummaryRanges {
  values: Set<number>;
  constructor() {
    this.values = new Set();
  }
  addNum(value: number): void {
    this.values.add(value);
  }
  getIntervals(): number[][] {
    const sorted = [...this.values].sort((a, b) => a - b);
    const res: number[][] = [];
    for (const value of sorted) {
      if (res.length && res[res.length - 1][1] + 1 === value) {
        res[res.length - 1][1] = value;
      } else {
        res.push([value, value]);
      }
    }
    return res;
  }
}
