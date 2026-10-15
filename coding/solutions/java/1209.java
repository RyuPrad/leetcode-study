class Solution {
    public String removeDuplicates(String s, int k) {
        Deque<int[]> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty() && stack.peek()[0] == c) {
                stack.peek()[1]++;
            } else {
                stack.push(new int[] { c, 1 });
            }
            if (stack.peek()[1] == k) {
                stack.pop();
            }
        }
        StringBuilder res = new StringBuilder();
        for (Iterator<int[]> it = stack.descendingIterator(); it.hasNext();) {
            int[] run = it.next();
            res.append(String.valueOf((char) run[0]).repeat(run[1]));
        }
        return res.toString();
    }
}
