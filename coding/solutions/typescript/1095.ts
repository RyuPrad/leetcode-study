/**
 * // This is the MountainArray's API interface.
 * // You should not implement it, or speculate about its implementation
 * class MountainArray {
 *      get(index: number): number {}
 *      length(): number {}
 * }
 */

function findInMountainArray(target: number, arr: MountainArray): number {
  const n = arr.length();
  let left = 0;
  let right = n - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr.get(mid) < arr.get(mid + 1)) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  const peak = left;
  const res = search(arr, target, 0, peak, true);
  if (res !== -1) {
    return res;
  }
  return search(arr, target, peak + 1, n - 1, false);
}

function search(arr: MountainArray, target: number, left: number, right: number, ascending: boolean): number {
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr.get(mid) === target) {
      return mid;
    }
    if (ascending) {
      if (arr.get(mid) < target) left = mid + 1;
      else right = mid - 1;
    } else {
      if (arr.get(mid) > target) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}
