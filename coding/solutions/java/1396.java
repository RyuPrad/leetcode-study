class UndergroundSystem {
    private Map<Integer, Object[]> checkIns = new HashMap<>();
    private Map<String, long[]> totals = new HashMap<>();

    public UndergroundSystem() {
    }

    public void checkIn(int id, String stationName, int t) {
        checkIns.put(id, new Object[] { stationName, t });
    }

    public void checkOut(int id, String stationName, int t) {
        Object[] trip = checkIns.get(id);
        checkIns.remove(id);
        String route = trip[0] + "," + stationName;
        long[] total = totals.getOrDefault(route, new long[2]);
        totals.put(route, new long[] { total[0] + t - (int) trip[1], total[1] + 1 });
    }

    public double getAverageTime(String startStation, String endStation) {
        long[] total = totals.get(startStation + "," + endStation);
        return (double) total[0] / total[1];
    }
}
