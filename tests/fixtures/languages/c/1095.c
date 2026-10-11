int findInMountainArray(int target, MountainArray* mountainArr) {
    int n = length(mountainArr), lo = 0, hi = n - 1;
    while (lo < hi) { int mid = (lo + hi) / 2; if (get(mountainArr, mid) < get(mountainArr, mid + 1)) lo = mid + 1; else hi = mid; }
    int peak = lo;
    lo = 0; hi = peak;
    while (lo <= hi) { int mid = (lo + hi) / 2, v = get(mountainArr, mid); if (v == target) return mid; if (v < target) lo = mid + 1; else hi = mid - 1; }
    lo = peak + 1; hi = n - 1;
    while (lo <= hi) { int mid = (lo + hi) / 2, v = get(mountainArr, mid); if (v == target) return mid; if (v > target) lo = mid + 1; else hi = mid - 1; }
    return -1;
}
