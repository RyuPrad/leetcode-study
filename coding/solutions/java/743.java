class MinHeap {
    private final List<int[]> heap = new ArrayList<>();
    int size() { return heap.size(); }
    void push(int[] item) {
        List<int[]> h = heap;
        h.add(item);
        int i = h.size() - 1;
        while (i > 0) {
            int p = (i - 1) >> 1;
            if (h.get(p)[0] <= h.get(i)[0]) break;
            Collections.swap(h, p, i);
            i = p;
        }
    }
    int[] pop() {
        List<int[]> h = heap;
        int[] top = h.get(0);
        int[] last = h.remove(h.size() - 1);
        if (h.size() > 0) {
            h.set(0, last);
            int i = 0;
            while (true) {
                int l = 2 * i + 1, r = 2 * i + 2, s = i;
                if (l < h.size() && h.get(l)[0] < h.get(s)[0]) s = l;
                if (r < h.size() && h.get(r)[0] < h.get(s)[0]) s = r;
                if (s == i) break;
                Collections.swap(h, s, i);
                i = s;
            }
        }
        return top;
    }
}
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>(); for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[] { t[1], t[2] });
        int[] dist = new int[n + 1]; Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        MinHeap heap = new MinHeap();
        heap.push(new int[] { 0, k });
        while (heap.size() > 0) {
            int[] top = heap.pop(); int d = top[0], node = top[1];
            if (d > dist[node]) continue;
            for (int[] edge : adj.get(node)) { int nei = edge[0], w = edge[1];
                if (d + w < dist[nei]) {
                    dist[nei] = d + w;
                    heap.push(new int[] { dist[nei], nei });
                }
            }
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            ans = Math.max(ans, dist[i]);
        }
        return ans;
    }
}
