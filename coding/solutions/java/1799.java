class Solution {
    public int maxScore(int[] nums) {
        int m = nums.length, full = (1 << m) - 1;
        int[] dp = new int[full + 1];
        for (int mask = 0; mask < full; mask++) {
            int used = Integer.bitCount(mask);
            if (used % 2 == 1) {
                continue;
            }
            int op = used / 2 + 1;
            for (int i = 0; i < m; i++) {
                if ((mask & (1 << i)) != 0) {
                    continue;
                }
                for (int j = i + 1; j < m; j++) {
                    if ((mask & (1 << j)) != 0) {
                        continue;
                    }
                    int next = mask | (1 << i) | (1 << j);
                    dp[next] = Math.max(dp[next], dp[mask] + op * gcd(nums[i], nums[j]));
                }
            }
        }
        return dp[full];
    }

    private int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }
}
