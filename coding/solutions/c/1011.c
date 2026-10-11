int shipWithinDays(int* weights, int weightsSize, int days) {
    int left = 0, right = 0;
    for (int i = 0; i < weightsSize; i++) {
        if (weights[i] > left) left = weights[i];
        right += weights[i];
    }
    int ans = right;
    while (left <= right) {
        int mid = (left + right) / 2;
        int need = 1;
        int cur = 0;
        for (int i = 0; i < weightsSize; i++) {
            if (cur + weights[i] > mid) {
                need++;
                cur = 0;
            }
            cur += weights[i];
        }
        if (need <= days) {
            ans = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return ans;
}
