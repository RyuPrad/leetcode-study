class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> next = new HashMap<>();
        Deque<Integer> stack = new ArrayDeque<>();
        for (int num : nums2) {
            while (!stack.isEmpty() && stack.peek() < num) {
                next.put(stack.pop(), num);
            }
            stack.push(num);
        }
        return Arrays.stream(nums1).map(num -> next.getOrDefault(num, -1)).toArray();
    }
}
