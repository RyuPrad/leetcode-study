class SeatManager {
    private int next;
    private final PriorityQueue<Integer> freed;

    public SeatManager(int n) {
        next = 1;
        freed = new PriorityQueue<>();
    }

    public int reserve() {
        if (!freed.isEmpty()) {
            return freed.poll();
        }
        return next++;
    }

    public void unreserve(int seatNumber) {
        freed.add(seatNumber);
    }
}
