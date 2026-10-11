function sortArray(nums: number[]): number[] {
  const merge = (left: number, mid: number, right: number): void => {
    const temp: number[] = [];
    let i = left;
    let j = mid + 1;
    while (i <= mid && j <= right) {
      if (nums[i] <= nums[j]) temp.push(nums[i++]);
      else temp.push(nums[j++]);
    }
    while (i <= mid) temp.push(nums[i++]);
    while (j <= right) temp.push(nums[j++]);
    for (let k = 0; k < temp.length; k++) {
      nums[left + k] = temp[k];
    }
  };
  const sort = (left: number, right: number): void => {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  };
  sort(0, nums.length - 1);
  return nums;
}
