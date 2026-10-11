function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>();

  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);

  for (const [num, countVal] of freq) {
    buckets[countVal].push(num);
  }

  const res: number[] = [];

  for (let count = buckets.length - 1; count >= 0; count--) {
    for (const num of buckets[count]) {
      res.push(num);
      if (res.length === k) return res;
    }
  }

  return res;
}
