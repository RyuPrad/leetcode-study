class DetectSquares {
  private counts = new Map<string, number>();

  add(point: number[]): void {
    const key = point[0] + "," + point[1];
    this.counts.set(key, (this.counts.get(key) || 0) + 1);
  }

  count(point: number[]): number {
    const x = point[0], y = point[1];
    let res = 0;
    for (const key of this.counts.keys()) {
      const parts = key.split(",");
      const px = Number(parts[0]), py = Number(parts[1]);
      if (Math.abs(px - x) === Math.abs(py - y) && px !== x && py !== y) {
        const c1 = this.counts.get(key)!;
        const c2 = this.counts.get(x + "," + py) || 0;
        const c3 = this.counts.get(px + "," + y) || 0;
        res += c1 * c2 * c3;
      }
    }
    return res;
  }
}
