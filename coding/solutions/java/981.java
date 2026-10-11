class TimeMap {
    private final Map<String, List<Map.Entry<Integer, String>>> store = new HashMap<>();

    public TimeMap() {
    }

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new ArrayList<>()).add(Map.entry(timestamp, value));
    }

    public String get(String key, int timestamp) {
        List<Map.Entry<Integer, String>> arr = store.getOrDefault(key, List.of());
        int left = 0;
        int right = arr.size() - 1;
        String res = "";
        while (left <= right) {
            int mid = (left + right) / 2;
            if (arr.get(mid).getKey() <= timestamp) {
                res = arr.get(mid).getValue();
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return res;
    }
}
