class Solution {
    public int eliminateMaximum(int[] dist, int[] speed) {
        int[] arrival = new int[dist.length];
        for (int i = 0; i < dist.length; i++) {
            arrival[i] = (dist[i] + speed[i] - 1) / speed[i];
        }
        Arrays.sort(arrival);
        for (int minute = 0; minute < arrival.length; minute++) {
            if (arrival[minute] <= minute) {
                return minute;
            }
        }
        return arrival.length;
    }
}
