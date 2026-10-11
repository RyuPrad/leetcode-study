class Solution {
    private int[] nums, temp;

    public int[] sortArray(int[] nums) {
        this.nums = nums;
        temp = new int[nums.length];
        sort(0, nums.length - 1);
        return nums;
    }

    private void sort(int left, int right) {
        if (left >= right) return;
        int mid = (left + right) / 2;
        sort(left, mid);
        sort(mid + 1, right);
        merge(left, mid, right);
    }

    private void merge(int left, int mid, int right) {
        int i = left, j = mid + 1, size = 0;
        while (i <= mid && j <= right) {
            if (nums[i] <= nums[j]) temp[size++] = nums[i++];
            else temp[size++] = nums[j++];
        }
        while (i <= mid) temp[size++] = nums[i++];
        while (j <= right) temp[size++] = nums[j++];
        System.arraycopy(temp, 0, nums, left, size);
    }
}
