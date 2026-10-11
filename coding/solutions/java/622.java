class MyCircularQueue {
    private final int[] queue;
    private int head = 0;
    private int count = 0;
    private final int capacity;

    public MyCircularQueue(int k) {
        queue = new int[k];
        capacity = k;
    }

    public boolean enQueue(int value) {
        if (isFull()) return false;
        queue[(head + count) % capacity] = value;
        count++;
        return true;
    }

    public boolean deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % capacity;
        count--;
        return true;
    }

    public int Front() {
        return isEmpty() ? -1 : queue[head];
    }

    public int Rear() {
        return isEmpty() ? -1 : queue[(head + count - 1) % capacity];
    }

    public boolean isEmpty() {
        return count == 0;
    }

    public boolean isFull() {
        return count == capacity;
    }
}
