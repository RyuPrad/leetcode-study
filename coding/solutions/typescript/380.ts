class RandomizedSet {
  values: number[];
  indexOf: Map<number, number>;
  constructor() {
    this.values = [];
    this.indexOf = new Map();
  }
  insert(val: number): boolean {
    if (this.indexOf.has(val)) {
      return false;
    }
    this.indexOf.set(val, this.values.length);
    this.values.push(val);
    return true;
  }
  remove(val: number): boolean {
    if (!this.indexOf.has(val)) {
      return false;
    }
    const index = this.indexOf.get(val)!, last = this.values[this.values.length - 1];
    this.values[index] = last;
    this.indexOf.set(last, index);
    this.values.pop();
    this.indexOf.delete(val);
    return true;
  }
  getRandom(): number {
    return this.values[Math.floor(Math.random() * this.values.length)];
  }
}
