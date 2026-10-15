class Solution {
    public int countOdds(int low, int high) {
        int upToHigh = (high + 1) / 2;
        int belowLow = low / 2;
        return upToHigh - belowLow;
    }
}
