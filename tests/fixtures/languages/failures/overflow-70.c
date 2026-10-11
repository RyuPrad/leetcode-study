int climbStairs(int n) {
    volatile char frame[4096];
    frame[0] = (char)n;
    return climbStairs(n + 1) + frame[0];
}
