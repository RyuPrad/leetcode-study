function minSwaps(s: string): number {
  let extraClose = 0, maxClose = 0;
  for (const c of s) {
    if (c === ']') {
      extraClose++;
    } else {
      extraClose--;
    }
    maxClose = Math.max(maxClose, extraClose);
  }
  return Math.floor((maxClose + 1) / 2);
}
