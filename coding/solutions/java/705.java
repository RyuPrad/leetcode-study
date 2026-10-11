class MyHashSet {
    private final int size = 8;
    private final List<List<Integer>> buckets = new ArrayList<>();

    public MyHashSet() {
        for (int i = 0; i < size; i++) buckets.add(new ArrayList<>());
    }

    private int hash(int key) {
        return key % size;
    }

    public void add(int key) {
        List<Integer> bucket = buckets.get(hash(key));
        if (!bucket.contains(key)) {
            bucket.add(key);
        }
    }

    public void remove(int key) {
        buckets.get(hash(key)).remove(Integer.valueOf(key));
    }

    public boolean contains(int key) {
        return buckets.get(hash(key)).contains(key);
    }
}
