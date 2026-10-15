class RandomizedSet {
    private List<Integer> values;
    private Map<Integer, Integer> indexOf;
    private Random random = new Random();

    public RandomizedSet() {
        values = new ArrayList<>();
        indexOf = new HashMap<>();
    }

    public boolean insert(int val) {
        if (indexOf.containsKey(val)) {
            return false;
        }
        indexOf.put(val, values.size());
        values.add(val);
        return true;
    }

    public boolean remove(int val) {
        if (!indexOf.containsKey(val)) {
            return false;
        }
        int index = indexOf.get(val), last = values.get(values.size() - 1);
        values.set(index, last);
        indexOf.put(last, index);
        values.remove(values.size() - 1);
        indexOf.remove(val);
        return true;
    }

    public int getRandom() {
        return values.get(random.nextInt(values.size()));
    }
}
