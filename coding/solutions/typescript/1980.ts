function findDifferentBinaryString(nums: string[]): string {
  const seen = new Set(nums);
  const n = nums.length;
  const build = (current: string): string | null => {
    if (current.length === n) {
      return seen.has(current) ? null : current;
    }
    const withZero = build(current + '0');
    if (withZero !== null) {
      return withZero;
    }
    return build(current + '1');
  };
  return build('')!;
}
