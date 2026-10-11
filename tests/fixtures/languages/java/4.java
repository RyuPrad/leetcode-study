class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] all = IntStream.concat(Arrays.stream(nums1), Arrays.stream(nums2)).sorted().toArray();
        int n = all.length;
        return n % 2 == 1 ? all[n / 2] : (all[n / 2 - 1] + all[n / 2]) / 2.0;
    }
}
