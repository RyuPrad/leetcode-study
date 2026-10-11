class Solution {
    public double myPow(double x, int n) {
        long power = n;
        if (power < 0) {
            x = 1 / x;
            power = -power;
        }
        double res = 1;
        while (power > 0) {
            if (power % 2 == 1) res *= x;
            x *= x;
            power /= 2;
        }
        return res;
    }
}
