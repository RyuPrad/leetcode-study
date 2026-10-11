double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    if (nums1Size > nums2Size) {
        return findMedianSortedArrays(nums2, nums2Size, nums1, nums1Size);
    }
    int m = nums1Size;
    int n = nums2Size;
    int left = 0;
    int right = m;
    int half = (m + n + 1) / 2;
    while (left <= right) {
        int i = (left + right) / 2;
        int j = half - i;
        double left1 = i > 0 ? nums1[i - 1] : -INFINITY;
        double right1 = i < m ? nums1[i] : INFINITY;
        double left2 = j > 0 ? nums2[j - 1] : -INFINITY;
        double right2 = j < n ? nums2[j] : INFINITY;
        if (left1 <= right2 && left2 <= right1) {
            double low = fmax(left1, left2);
            if ((m + n) % 2 == 1) {
                return low;
            }
            return (low + fmin(right1, right2)) / 2;
        } else if (left1 > right2) {
            right = i - 1;
        } else {
            left = i + 1;
        }
    }
    return 0;
}
