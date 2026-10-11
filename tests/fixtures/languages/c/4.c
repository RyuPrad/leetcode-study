double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    int total = nums1Size + nums2Size, i = 0, j = 0, prev = 0, curr = 0;
    for (int k = 0; k <= total / 2; k++) {
        prev = curr;
        if (i < nums1Size && (j >= nums2Size || nums1[i] <= nums2[j])) curr = nums1[i++];
        else curr = nums2[j++];
    }
    return total % 2 ? curr : (prev + curr) / 2.0;
}
