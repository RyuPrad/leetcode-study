/**
 * *********************************************************************
 * // This is the MountainArray's API interface.
 * // You should not implement it, or speculate about its implementation
 * *********************************************************************
 *
 * int get(MountainArray *, int index);
 * int length(MountainArray *);
 */

static int search(MountainArray* arr, int target, int left, int right, bool ascending) {
    while (left <= right) {
        int mid = (left + right) / 2;
        int value = get(arr, mid);
        if (value == target) {
            return mid;
        }
        if (ascending) {
            if (value < target) left = mid + 1;
            else right = mid - 1;
        } else {
            if (value > target) left = mid + 1;
            else right = mid - 1;
        }
    }
    return -1;
}

int findInMountainArray(int target, MountainArray* mountainArr) {
    int n = length(mountainArr);
    int left = 0;
    int right = n - 1;
    while (left < right) {
        int mid = (left + right) / 2;
        if (get(mountainArr, mid) < get(mountainArr, mid + 1)) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    int peak = left;
    int res = search(mountainArr, target, 0, peak, true);
    if (res != -1) {
        return res;
    }
    return search(mountainArr, target, peak + 1, n - 1, false);
}
