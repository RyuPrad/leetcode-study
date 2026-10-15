class Solution {
    public int[] longestObstacleCourseAtEachPosition(int[] obstacles) {
        int n = obstacles.length;
        int[] tails = new int[n];
        int size = 0;
        int[] res = new int[n];
        for (int k = 0; k < n; k++) {
            int height = obstacles[k];
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) >> 1;
                if (tails[mid] <= height) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }
            tails[lo] = height;
            if (lo == size) size++;
            res[k] = lo + 1;
        }
        return res;
    }
}
