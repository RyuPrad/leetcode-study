function findDifference(nums1: number[], nums2: number[]): number[][] {
  const set1 = new Set(nums1), set2 = new Set(nums2);
  const only1 = [...set1].filter(num => !set2.has(num));
  const only2 = [...set2].filter(num => !set1.has(num));
  return [only1, only2];
}
