function containsNearbyDuplicate(nums: number[], k: number): boolean {
  const seen = new Set<number>();
  for (let i = 0; i < nums.length; i++) {
    if (i > k) {
      seen.delete(nums[i - k - 1]);
    }
    if (seen.has(nums[i])) {
      return true;
    }
    seen.add(nums[i]);
  }
  return false;
}
