class FreqStack {
  private freq = new Map<number, number>();
  private group = new Map<number, number[]>();
  private maxFreq = 0;

  push(val: number): void {
    const f = (this.freq.get(val) || 0) + 1;
    this.freq.set(val, f);
    if (f > this.maxFreq) {
      this.maxFreq = f;
    }
    if (!this.group.has(f)) {
      this.group.set(f, []);
    }
    this.group.get(f)!.push(val);
  }

  pop(): number {
    const stack = this.group.get(this.maxFreq)!;
    const val = stack.pop()!;
    this.freq.set(val, this.maxFreq - 1);
    if (stack.length === 0) {
      this.maxFreq--;
    }
    return val;
  }
}
