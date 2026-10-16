class Solution {
    public int numOfMinutes(int n, int headID, int[] manager, int[] informTime) {
        List<List<Integer>> reports = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            reports.add(new ArrayList<>());
        }
        for (int i = 0; i < n; i++) {
            if (manager[i] != -1) {
                reports.get(manager[i]).add(i);
            }
        }
        int[] ids = new int[n], times = new int[n];
        int size = 0;
        ids[size] = headID;
        times[size++] = 0;
        int res = 0;
        for (int head = 0; head < size; head++) {
            int id = ids[head], time = times[head];
            res = Math.max(res, time);
            for (int next : reports.get(id)) {
                ids[size] = next;
                times[size++] = time + informTime[id];
            }
        }
        return res;
    }
}
