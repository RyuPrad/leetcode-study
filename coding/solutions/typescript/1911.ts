function maxAlternatingSum(nums: number[]): number {
  let plus = 0, minus = 0;
  for (const num of nums) {
    const nextPlus = Math.max(plus, minus + num);
    const nextMinus = Math.max(minus, plus - num);
    plus = nextPlus;
    minus = nextMinus;
  }
  return plus;
}
