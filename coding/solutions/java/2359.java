class Solution {
    public int closestMeetingNode(int[] edges, int node1, int node2) {
        int[] d1 = distances(edges, node1), d2 = distances(edges, node2);
        int res = -1, best = Integer.MAX_VALUE;
        for (int node = 0; node < edges.length; node++) {
            if (d1[node] != -1 && d2[node] != -1 && Math.max(d1[node], d2[node]) < best) {
                best = Math.max(d1[node], d2[node]);
                res = node;
            }
        }
        return res;
    }

    private int[] distances(int[] edges, int start) {
        int[] dist = new int[edges.length];
        Arrays.fill(dist, -1);
        int node = start, d = 0;
        while (node != -1 && dist[node] == -1) {
            dist[node] = d++;
            node = edges[node];
        }
        return dist;
    }
}
