class TimeMap {
    private final Map<String, TreeMap<Integer, String>> map = new HashMap<>();
    public TimeMap() {}
    public void set(String key, String value, int timestamp) { map.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value); }
    public String get(String key, int timestamp) {
        TreeMap<Integer, String> times = map.get(key);
        if (times == null) return "";
        Map.Entry<Integer, String> entry = times.floorEntry(timestamp);
        return entry == null ? "" : entry.getValue();
    }
}
