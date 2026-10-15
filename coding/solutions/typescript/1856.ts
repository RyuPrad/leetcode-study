function maxSumMinProduct(nums: number[]): number {
  const prefix = [0];
  for (const num of nums) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
  const stack: [number, number][] = [];
  let res = 0n;
  for (let i = 0; i <= nums.length; i++) {
    const value = i < nums.length ? nums[i] : 0;
    let start = i;
    while (stack.length && stack[stack.length - 1][1] > value) {
      const [left, min] = stack.pop()!;
      const product = BigInt(min) * BigInt(prefix[i] - prefix[left]);
      if (product > res) {
        res = product;
      }
      start = left;
    }
    stack.push([start, value]);
  }
  return Number(res % 1000000007n);
}
