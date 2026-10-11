class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }
        int m = nums1.length;
        int n = nums2.length;
        int left = 0;
        int right = m;
        int half = (m + n + 1) / 2;
        while (left <= right) {
            int i = (left + right) / 2;
            int j = half - i;
            double left1 = i > 0 ? nums1[i - 1] : Double.NEGATIVE_INFINITY;
            double right1 = i < m ? nums1[i] : Double.POSITIVE_INFINITY;
            double left2 = j > 0 ? nums2[j - 1] : Double.NEGATIVE_INFINITY;
            double right2 = j < n ? nums2[j] : Double.POSITIVE_INFINITY;
            if (left1 <= right2 && left2 <= right1) {
                if ((m + n) % 2 == 1) {
                    return Math.max(left1, left2);
                }
                return (Math.max(left1, left2) + Math.min(right1, right2)) / 2;
            } else if (left1 > right2) {
                right = i - 1;
            } else {
                left = i + 1;
            }
        }
        return 0;
    }
}
