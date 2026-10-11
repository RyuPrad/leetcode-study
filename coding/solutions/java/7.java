class Solution {
    public int reverse(int x) {
        long value = Math.abs((long) x);
        long res = 0;
        while (value > 0) {
            res = res * 10 + value % 10;
            value /= 10;
        }
        res = x < 0 ? -res : res;
        if (res < Integer.MIN_VALUE || res > Integer.MAX_VALUE) return 0;
        return (int) res;
    }
}
