function mostBooked(n: number, meetings: number[][]): number {
  meetings.sort((a, b) => a[0] - b[0]);
  const count: number[] = new Array(n).fill(0);
  const available: number[] = [];
  for (let r = 0; r < n; r++) available.push(r);
  const busy: number[][] = [];
  for (const [start, end] of meetings) {
    while (busy.length > 0 && busy[0][0] <= start) {
      const room = busy.shift()![1];
      available.push(room);
      available.sort((a, b) => a - b);
    }
    if (available.length > 0) {
      const room = available.shift()!;
      count[room]++;
      busy.push([end, room]);
      busy.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    } else {
      busy.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const [freeTime, room] = busy.shift()!;
      count[room]++;
      busy.push([freeTime + (end - start), room]);
      busy.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    }
  }
  let best = 0;
  for (let r = 1; r < n; r++) {
    if (count[r] > count[best]) best = r;
  }
  return best;
}
