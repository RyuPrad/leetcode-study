function replaceElements(arr: number[]): number[] {
  let rightMax = -1;
  for (let i = arr.length - 1; i >= 0; i--) {
    const current = arr[i];
    arr[i] = rightMax;
    rightMax = Math.max(rightMax, current);
  }
  return arr;
}
