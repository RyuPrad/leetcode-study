function maxSlidingWindow(nums: number[], k: number): number[] {
  const res: number[] = [];
  const deque: number[] = [];
  for (let right = 0; right < nums.length; right++) {
    while (deque.length && nums[deque[deque.length - 1]] < nums[right]) {
      deque.pop();
    }
    deque.push(right);
    if (deque[0] <= right - k) {
      deque.shift();
    }
    if (right >= k - 1) {
      res.push(nums[deque[0]]);
    }
  }
  return res;
}
