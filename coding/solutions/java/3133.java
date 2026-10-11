class Solution {
    public long minEnd(int n, int x) {
        long result = x;
        long remaining = n - 1;
        long bit = 1;
        while (remaining > 0) {
            if ((result & bit) == 0) {
                if ((remaining & 1) == 1) {
                    result |= bit;
                }
                remaining >>= 1;
            }
            bit <<= 1;
        }
        return result;
    }
}
