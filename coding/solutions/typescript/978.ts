function maxTurbulenceSize(arr: number[]): number {
  let ans = 1;
  let inc = 1, dec = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[i - 1]) { inc = dec + 1; dec = 1; }
    else if (arr[i] < arr[i - 1]) { dec = inc + 1; inc = 1; }
    else { inc = 1; dec = 1; }
    ans = Math.max(ans, inc, dec);
  }
  return ans;
}
