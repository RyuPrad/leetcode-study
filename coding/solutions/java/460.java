class LFUCache {
    private final int capacity;
    private final Map<Integer, Integer> keyToVal = new HashMap<>();
    private final Map<Integer, Integer> keyToFreq = new HashMap<>();
    // Insertion-ordered sets: the first key of the lowest frequency is least recently used.
    private final Map<Integer, LinkedHashSet<Integer>> freqToKeys = new HashMap<>();
    private int minFreq = 0;

    public LFUCache(int capacity) {
        this.capacity = capacity;
    }

    public int get(int key) {
        if (!keyToVal.containsKey(key)) return -1;
        touch(key);
        return keyToVal.get(key);
    }

    public void put(int key, int value) {
        if (capacity == 0) return;
        if (keyToVal.containsKey(key)) {
            keyToVal.put(key, value);
            touch(key);
            return;
        }
        if (keyToVal.size() >= capacity) {
            LinkedHashSet<Integer> keys = freqToKeys.get(minFreq);
            int evict = keys.iterator().next();
            keys.remove(evict);
            keyToVal.remove(evict);
            keyToFreq.remove(evict);
        }
        keyToVal.put(key, value);
        keyToFreq.put(key, 1);
        freqToKeys.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minFreq = 1;
    }

    private void touch(int key) {
        int f = keyToFreq.get(key);
        keyToFreq.put(key, f + 1);
        freqToKeys.get(f).remove(key);
        if (freqToKeys.get(f).isEmpty()) {
            freqToKeys.remove(f);
            if (minFreq == f) minFreq++;
        }
        freqToKeys.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }
}
