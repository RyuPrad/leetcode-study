class Solution {
    public long minEnd(int n, int x) {
        long result = x, remaining = n - 1;
        for (long bit = 1; remaining > 0; bit <<= 1)
            if ((result & bit) == 0) { if ((remaining & 1) == 1) result |= bit; remaining >>= 1; }
        return result;
    }
}
