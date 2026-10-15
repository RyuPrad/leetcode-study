function numOfSubarrays(arr: number[], k: number, threshold: number): number {
  let res = 0, sum = 0;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    if (right >= k) {
      sum -= arr[right - k];
    }
    if (right >= k - 1 && sum >= k * threshold) {
      res++;
    }
  }
  return res;
}
