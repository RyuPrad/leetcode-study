class Solution {
    public String kthLargestNumber(String[] nums, int k) {
        Comparator<String> smaller = (a, b) -> a.length() != b.length() ? a.length() - b.length() : a.compareTo(b);
        PriorityQueue<String> heap = new PriorityQueue<>(smaller);
        for (String num : nums) {
            heap.add(num);
            if (heap.size() > k) {
                heap.poll();
            }
        }
        return heap.peek();
    }
}
