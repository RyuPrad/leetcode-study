function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let ans = 0;

  while (left < right) {
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    const area = width * currentHeight;

    ans = Math.max(ans, area);

    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return ans;
}
