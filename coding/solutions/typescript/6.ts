function convert(s: string, numRows: number): string {
  if (numRows === 1) {
    return s;
  }
  const rows: string[] = new Array(numRows).fill('');
  let row = 0, step = 1;
  for (const c of s) {
    rows[row] += c;
    if (row === 0) {
      step = 1;
    } else if (row === numRows - 1) {
      step = -1;
    }
    row += step;
  }
  return rows.join('');
}
