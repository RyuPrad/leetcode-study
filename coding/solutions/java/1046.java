class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int s : stones) {
            heap.add(s);
        }
        while (heap.size() > 1) {
            int a = heap.poll();
            int b = heap.poll();
            if (a != b) {
                heap.add(a - b);
            }
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }
}
