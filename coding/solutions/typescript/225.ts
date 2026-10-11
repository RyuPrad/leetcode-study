class MyStack {
  private q: number[];

  constructor() {
    this.q = [];
  }

  push(x: number): void {
    this.q.push(x);
    for (let i = 0; i < this.q.length - 1; i++) {
      this.q.push(this.q.shift()!);
    }
  }

  pop(): number {
    return this.q.shift()!;
  }

  top(): number {
    return this.q[0];
  }

  empty(): boolean {
    return this.q.length === 0;
  }
}
