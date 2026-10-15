function addToArrayForm(num: number[], k: number): number[] {
  const res: number[] = [];
  let i = num.length - 1;
  while (i >= 0 || k > 0) {
    if (i >= 0) {
      k += num[i];
    }
    res.push(k % 10);
    k = Math.floor(k / 10);
    i--;
  }
  return res.reverse();
}
