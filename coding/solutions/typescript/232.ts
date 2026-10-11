class MyQueue {
  private sIn: number[];
  private sOut: number[];

  constructor() {
    this.sIn = [];
    this.sOut = [];
  }

  push(x: number): void {
    this.sIn.push(x);
  }

  pop(): number {
    this.peek();
    return this.sOut.pop()!;
  }

  peek(): number {
    if (this.sOut.length === 0) {
      while (this.sIn.length) {
        this.sOut.push(this.sIn.pop()!);
      }
    }
    return this.sOut[this.sOut.length - 1];
  }

  empty(): boolean {
    return this.sIn.length === 0 && this.sOut.length === 0;
  }
}
