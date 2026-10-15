class Solution {
    public int removeCoveredIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);
        int res = 0, maxEnd = 0;
        for (int[] interval : intervals) {
            if (interval[1] > maxEnd) {
                res++;
                maxEnd = interval[1];
            }
        }
        return res;
    }
}
