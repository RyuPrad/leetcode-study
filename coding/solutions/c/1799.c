static int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}

static int bitCount(int mask) {
    int count = 0;
    while (mask) {
        count += mask & 1;
        mask >>= 1;
    }
    return count;
}

int maxScore(int* nums, int numsSize) {
    int m = numsSize, full = (1 << m) - 1;
    int* dp = calloc(full + 1, sizeof(int));
    for (int mask = 0; mask < full; mask++) {
        int used = bitCount(mask);
        if (used % 2 == 1) {
            continue;
        }
        int op = used / 2 + 1;
        for (int i = 0; i < m; i++) {
            if (mask & (1 << i)) {
                continue;
            }
            for (int j = i + 1; j < m; j++) {
                if (mask & (1 << j)) {
                    continue;
                }
                int next = mask | (1 << i) | (1 << j);
                int score = dp[mask] + op * gcd(nums[i], nums[j]);
                if (score > dp[next]) dp[next] = score;
            }
        }
    }
    int res = dp[full];
    free(dp);
    return res;
}
