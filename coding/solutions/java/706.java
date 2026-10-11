class MyHashMap {
    private final int size = 8;
    private final List<List<int[]>> buckets = new ArrayList<>();

    public MyHashMap() {
        for (int i = 0; i < size; i++) buckets.add(new ArrayList<>());
    }

    private int hash(int key) {
        return key % size;
    }

    public void put(int key, int value) {
        for (int[] pair : buckets.get(hash(key))) {
            if (pair[0] == key) {
                pair[1] = value;
                return;
            }
        }
        buckets.get(hash(key)).add(new int[] { key, value });
    }

    public int get(int key) {
        for (int[] pair : buckets.get(hash(key))) {
            if (pair[0] == key) return pair[1];
        }
        return -1;
    }

    public void remove(int key) {
        buckets.get(hash(key)).removeIf(pair -> pair[0] == key);
    }
}
