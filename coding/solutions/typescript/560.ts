function subarraySum(nums: number[], k: number): number {
  const freq = new Map<number, number>();
  freq.set(0, 1);
  let sum = 0;
  let count = 0;
  for (const num of nums) {
    sum += num;
    if (freq.has(sum - k)) {
      count += freq.get(sum - k)!;
    }
    freq.set(sum, (freq.get(sum) || 0) + 1);
  }
  return count;
}
