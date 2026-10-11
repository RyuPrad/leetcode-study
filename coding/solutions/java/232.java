class MyQueue {
    private final Deque<Integer> sIn = new ArrayDeque<>();
    private final Deque<Integer> sOut = new ArrayDeque<>();

    public MyQueue() {
    }

    public void push(int x) {
        sIn.push(x);
    }

    public int pop() {
        peek();
        return sOut.pop();
    }

    public int peek() {
        if (sOut.isEmpty()) {
            while (!sIn.isEmpty()) {
                sOut.push(sIn.pop());
            }
        }
        return sOut.peek();
    }

    public boolean empty() {
        return sIn.isEmpty() && sOut.isEmpty();
    }
}
