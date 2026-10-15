function find132pattern(nums: number[]): boolean {
  const stack: number[] = [];
  let third = -Infinity;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] < third) {
      return true;
    }
    while (stack.length > 0 && stack[stack.length - 1] < nums[i]) {
      third = stack.pop()!;
    }
    stack.push(nums[i]);
  }
  return false;
}
