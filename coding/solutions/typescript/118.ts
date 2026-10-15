function generate(numRows: number): number[][] {
  const res: number[][] = [[1]];
  for (let i = 1; i < numRows; i++) {
    const prev = res[i - 1];
    const row = [1];
    for (let j = 1; j < i; j++) {
      row.push(prev[j - 1] + prev[j]);
    }
    row.push(1);
    res.push(row);
  }
  return res;
}
