class Solution {
    public long minimumFuelCost(int[][] roads, int seats) {
        int n = roads.length + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] road : roads) {
            adj.get(road[0]).add(road[1]);
            adj.get(road[1]).add(road[0]);
        }
        int[] parent = new int[n];
        Arrays.fill(parent, -1);
        parent[0] = 0;
        int[] order = new int[n];
        int size = 1;
        for (int i = 0; i < size; i++) {
            for (int next : adj.get(order[i])) {
                if (parent[next] == -1) {
                    parent[next] = order[i];
                    order[size++] = next;
                }
            }
        }
        long[] people = new long[n];
        Arrays.fill(people, 1);
        long fuel = 0;
        for (int i = n - 1; i > 0; i--) {
            int node = order[i];
            fuel += (people[node] + seats - 1) / seats;
            people[parent[node]] += people[node];
        }
        return fuel;
    }
}
