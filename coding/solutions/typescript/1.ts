function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const need = target - num;

    if (seen.has(need)) {
      return [seen.get(need)!, i];
    }

    seen.set(num, i);
  }
  return [];
}
