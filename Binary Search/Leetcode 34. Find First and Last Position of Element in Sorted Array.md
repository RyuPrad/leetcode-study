# Leetcode 34. Find First and Last Position of Element in Sorted Array

[LeetCode problem](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

<iframe src="find_first_and_last_position_of_element_in_sorted_array_visualizer.html" width="100%" height="800px" frameborder="0" allowfullscreen></iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | sorted input array with duplicates allowed |
| `target` | value whose range is sought |
| `phase` | lower-bound, upper-bound, or result phase |
| `left` | included left search bound |
| `right` | excluded right search bound; n is a legal sentinel |
| `mid` | middle index in the current nonempty window |
| `first` | first index with a value at least target |
| `afterLast` | first index with a value greater than target |
| `ans` | inclusive first and last indices, or [-1, -1] |

## Problem

Given an array `nums` sorted in nondecreasing order and an integer `target`, return the first and last indices occupied by the target. If the target is absent, return `[-1, -1]`.

The required running time is `O(log n)`. Duplicate values and an empty array are valid inputs.

```text
nums = [5, 7, 7, 8, 8, 10], target = 8  → [3, 4]
nums = [5, 7, 7, 8, 8, 10], target = 6  → [-1, -1]
nums = [], target = 0                   → [-1, -1]
```

## The key idea: find two boundaries

An ordinary binary search can find any matching index. Stopping at that match cannot tell us where the run of duplicates starts or ends. Scanning outward from a match would take `O(n)` time when every element equals the target.

Instead, perform two independent binary searches:

1. **Lower bound:** find `first`, the first index with `nums[i] >= target`.
2. **Upper bound:** find `afterLast`, the first index with `nums[i] > target`.

If no index satisfies one of these conditions, that boundary is `nums.length`, written as `n`.

All target values lie in the half-open range `[first, afterLast)`. If the target actually exists, the requested inclusive endpoints are `[first, afterLast - 1]`.

## Why use a half-open search window?

Both searches keep a window `[left, right)`:

- `left` is included.
- `right` is excluded.
- Initialize `left = 0`, `right = nums.length`.
- Continue only while `left < right`.
- The midpoint is `left + Math.floor((right - left) / 2)`.

While the window is nonempty, `left <= mid < right <= n`, so `nums[mid]` is always a real element. The sentinel `n` is a valid boundary, but never a midpoint or an element to compare.

When the pointers meet, the remaining boundary is `left`. Do not use `right = mid - 1`: the boundary candidate at `mid` must remain possible.

## Lower-bound search

The invariant is:

- Every index below `left` has a value **less than** target.
- Every index at or above `right` has a value **at least** target.

When `nums[mid] < target`, discard that midpoint and everything before it with `left = mid + 1`.

Otherwise, `mid` could be the first index whose value is at least target. Set `right = mid`. Equality therefore moves the right boundary toward the beginning of the duplicate run.

When `left === right`, save `first = left`.

## Upper-bound search

Reset **both** pointers to `left = 0`, `right = nums.length`. This is a separate search of the whole array.

The invariant changes slightly:

- Every index below `left` has a value **less than or equal to** target.
- Every index at or above `right` has a value **greater than** target.

When `nums[mid] <= target`, set `left = mid + 1`. Equality now moves left forward, past the duplicate run.

Otherwise, set `right = mid`.

When the pointers meet, save `afterLast = left`.

The only comparison change between the searches is `< target` versus `<= target`. Use that direct comparison rather than searching for `target + 1`, which is unnecessary and can exceed a language's safe numeric range.

## Check existence, then return the range

A lower bound is also an insertion position, so finding it does not prove the target exists. After both searches:

- If `first === nums.length`, the target is absent.
- Otherwise, if `nums[first] !== target`, the target is absent.
- Otherwise, return `[first, afterLast - 1]`.

The `||` condition short-circuits at `first === nums.length`, so it never needs to read the sentinel as an array element.

## JavaScript solution

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function(nums, target) {
  let left = 0;
  let right = nums.length;
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  const first = left;
  left = 0;
  right = nums.length;
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  const afterLast = left;
  if (first === nums.length || nums[first] !== target) {
    return [-1, -1];
  }
  return [first, afterLast - 1];
};
```

## Walkthrough

For `nums = [5, 7, 7, 8, 8, 10]`, `target = 8`:

1. Lower search, `[0, 6)`: `mid = 3`, so `8 < 8` is false. Set `right = 3`.
2. Lower search, `[0, 3)`: `mid = 1`, so `7 < 8` is true. Set `left = 2`.
3. Lower search, `[2, 3)`: `mid = 2`, so `7 < 8` is true. Set `left = 3`.
4. Bounds meet at `[3, 3)`. Save `first = 3`, then reset both bounds to `[0, 6)`.
5. Upper search, `[0, 6)`: `mid = 3`, so `8 <= 8` is true. Set `left = 4`.
6. Upper search, `[4, 6)`: `mid = 5`, so `10 <= 8` is false. Set `right = 5`.
7. Upper search, `[4, 5)`: `mid = 4`, so `8 <= 8` is true. Set `left = 5`.
8. Bounds meet at `[5, 5)`. Save `afterLast = 5`. Since `nums[3] === 8`, return `[3, 4]`.

The visualizer executes one pending reference-code line per Step Over. It shows the lower/upper phase, each pointer reset, the excluded `n` boundary, saved bounds, and the final inclusive range. Step Back restores earlier algorithm state; pins stay under your control. Historical previews do not mutate the live execution.

## Edge cases

- Empty array `[]`, target `0`: boundaries `(0, 0)`; return `[-1, -1]`.
- Singleton `[1]`, target `1`: boundaries `(0, 1)`; return `[0, 0]`.
- Singleton `[1]`, target `0`: boundaries `(0, 0)`; return `[-1, -1]`.
- Singleton `[1]`, target `2`: boundaries `(1, 1)`; return `[-1, -1]`.
- All equal `[2, 2, 2, 2]`, target `2`: boundaries `(0, 4)`; return `[0, 3]`.
- Absent between values `[1, 3, 3, 5]`, target `4`: boundaries `(3, 3)`; return `[-1, -1]`.
- Negative duplicates `[-3, -3, 0]`, target `-3`: boundaries `(0, 2)`; return `[0, 1]`.

Custom visualizer input accepts sorted safe integers, duplicates, and `[]`. Invalid arrays, unsorted values, and invalid or blank targets are rejected without resetting the current execution, history, or pins.

## Correctness and complexity

Each update preserves the relevant invariant and strictly shrinks `right - left`. The loop therefore terminates at the unique boundary separating values that fail the search condition from values that satisfy it.

The lower bound locates the first target, if one exists. The upper bound locates the first value after the target's contiguous run. The existence check distinguishes a genuine run from an insertion position. Therefore, the returned inclusive range is correct, including when the array is empty or the target is absent.

- **Time:** `O(log n)` for nonempty arrays, from two binary searches; empty input takes `O(1)`.
- **Auxiliary space:** `O(1)` for the algorithm. The visualizer's recorded history and trace are teaching features, not part of the solution's space cost.
