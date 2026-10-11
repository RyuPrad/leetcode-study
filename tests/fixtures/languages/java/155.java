class MinStack {
    private final Deque<int[]> stack = new ArrayDeque<>();
    public MinStack() {}
    public void push(int val) { stack.push(new int[] { val, stack.isEmpty() ? val : Math.min(val, stack.peek()[1]) }); }
    public void pop() { stack.pop(); }
    public int top() { return stack.peek()[0]; }
    public int getMin() { return stack.peek()[1]; }
}
