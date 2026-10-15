class SummaryRanges {
    private final Set<Integer> values;

    public SummaryRanges() {
        values = new HashSet<>();
    }

    public void addNum(int value) {
        values.add(value);
    }

    public int[][] getIntervals() {
        List<Integer> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        List<int[]> res = new ArrayList<>();
        for (int value : sorted) {
            if (!res.isEmpty() && res.get(res.size() - 1)[1] + 1 == value) {
                res.get(res.size() - 1)[1] = value;
            } else {
                res.add(new int[] {value, value});
            }
        }
        return res.toArray(new int[0][]);
    }
}
