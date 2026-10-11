function findClosestElements(arr: number[], k: number, x: number): number[] {
  let left = 0;
  let right = arr.length - 1;
  while (right - left + 1 > k) {
    if (x - arr[left] > arr[right] - x) {
      left++;
    } else {
      right--;
    }
  }
  return arr.slice(left, right + 1);
}
