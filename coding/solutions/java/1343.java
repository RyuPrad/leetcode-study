class Solution {
    public int numOfSubarrays(int[] arr, int k, int threshold) {
        int res = 0, sum = 0;
        for (int right = 0; right < arr.length; right++) {
            sum += arr[right];
            if (right >= k) {
                sum -= arr[right - k];
            }
            if (right >= k - 1 && sum >= k * threshold) {
                res++;
            }
        }
        return res;
    }
}
