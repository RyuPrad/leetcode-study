class LRUCache {
    private final int capacity;
    // Insertion order, like a JavaScript Map: re-inserting a key makes it most recent.
    private final LinkedHashMap<Integer, Integer> cache = new LinkedHashMap<>();

    public LRUCache(int capacity) {
        this.capacity = capacity;
    }

    public int get(int key) {
        if (!cache.containsKey(key)) return -1;
        int value = cache.remove(key);
        cache.put(key, value);
        return value;
    }

    public void put(int key, int value) {
        if (cache.containsKey(key)) {
            cache.remove(key);
        } else if (cache.size() >= capacity) {
            int lru = cache.keySet().iterator().next();
            cache.remove(lru);
        }
        cache.put(key, value);
    }
}
