int minEatingSpeed(int* piles, int pilesSize, int h) {
    int left = 1;
    int right = 0;
    for (int i = 0; i < pilesSize; i++) if (piles[i] > right) right = piles[i];
    int ans = right;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        long long hours = 0;
        for (int i = 0; i < pilesSize; i++) {
            hours += ((long long)piles[i] + mid - 1) / mid;
        }
        if (hours <= h) {
            ans = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return ans;
}
