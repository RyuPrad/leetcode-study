function nextGreaterElement(nums1: number[], nums2: number[]): number[] {
  const next = new Map<number, number>();
  const stack: number[] = [];
  for (const num of nums2) {
    while (stack.length > 0 && stack[stack.length - 1] < num) {
      next.set(stack.pop()!, num);
    }
    stack.push(num);
  }
  return nums1.map(num => next.has(num) ? next.get(num)! : -1);
}
