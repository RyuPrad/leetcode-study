class StockSpanner {
    private final Deque<int[]> stack = new ArrayDeque<>();

    public StockSpanner() {
    }

    public int next(int price) {
        int span = 1;
        while (!stack.isEmpty() && stack.peek()[0] <= price) {
            span += stack.pop()[1];
        }
        stack.push(new int[] { price, span });
        return span;
    }
}
