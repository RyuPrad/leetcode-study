class Solution {
    public String longestDiverseString(int a, int b, int c) {
        // Larger count first; ties go to the larger letter.
        PriorityQueue<int[]> heap = new PriorityQueue<>((x, y) -> x[0] != y[0] ? y[0] - x[0] : y[1] - x[1]);
        if (a > 0) heap.add(new int[] { a, 'a' });
        if (b > 0) heap.add(new int[] { b, 'b' });
        if (c > 0) heap.add(new int[] { c, 'c' });
        StringBuilder res = new StringBuilder();
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int n = res.length();
            if (n >= 2 && res.charAt(n - 1) == top[1] && res.charAt(n - 2) == top[1]) {
                if (heap.isEmpty()) break;
                int[] second = heap.poll();
                res.append((char) second[1]);
                if (second[0] - 1 > 0) heap.add(new int[] { second[0] - 1, second[1] });
                heap.add(top);
            } else {
                res.append((char) top[1]);
                if (top[0] - 1 > 0) heap.add(new int[] { top[0] - 1, top[1] });
            }
        }
        return res.toString();
    }
}
