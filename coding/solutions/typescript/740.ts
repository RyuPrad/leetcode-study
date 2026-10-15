function deleteAndEarn(nums: number[]): number {
  const max = Math.max(...nums);
  const points: number[] = new Array(max + 1).fill(0);
  for (const num of nums) {
    points[num] += num;
  }
  let take = 0, skip = 0;
  for (let v = 0; v <= max; v++) {
    const takeV = skip + points[v];
    skip = Math.max(skip, take);
    take = takeV;
  }
  return Math.max(take, skip);
}
