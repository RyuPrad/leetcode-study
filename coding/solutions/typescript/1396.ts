class UndergroundSystem {
  checkIns: Map<number, [string, number]>;
  totals: Map<string, [number, number]>;
  constructor() {
    this.checkIns = new Map();
    this.totals = new Map();
  }
  checkIn(id: number, stationName: string, t: number): void {
    this.checkIns.set(id, [stationName, t]);
  }
  checkOut(id: number, stationName: string, t: number): void {
    const [start, startTime] = this.checkIns.get(id)!;
    this.checkIns.delete(id);
    const route = start + ',' + stationName;
    const [sum, count] = this.totals.get(route) || [0, 0];
    this.totals.set(route, [sum + t - startTime, count + 1]);
  }
  getAverageTime(startStation: string, endStation: string): number {
    const [sum, count] = this.totals.get(startStation + ',' + endStation)!;
    return sum / count;
  }
}
