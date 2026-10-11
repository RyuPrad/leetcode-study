class Solution {
    public int climbStairs(int n) {
        return climbStairs(n + 1) + 1;
    }
}
