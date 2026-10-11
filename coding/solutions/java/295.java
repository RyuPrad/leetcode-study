class MedianFinder {
    private final PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder()); // lower half
    private final PriorityQueue<Integer> large = new PriorityQueue<>(); // upper half

    public MedianFinder() {
    }

    public void addNum(int num) {
        small.add(num);
        if (!small.isEmpty() && !large.isEmpty() && small.peek() > large.peek()) {
            large.add(small.poll());
        }
        if (small.size() > large.size() + 1) {
            large.add(small.poll());
        }
        if (large.size() > small.size() + 1) {
            small.add(large.poll());
        }
    }

    public double findMedian() {
        if (small.size() > large.size()) return small.peek();
        if (large.size() > small.size()) return large.peek();
        return (small.peek() + (double) large.peek()) / 2;
    }
}
