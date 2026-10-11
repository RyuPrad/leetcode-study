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
    public int minCostConnectPoints(int[][] points) {
        int n = points.length;
        boolean[] inMST = new boolean[n];
        MinHeap heap = new MinHeap();
        heap.push(new int[] { 0, 0 });
        int total = 0, count = 0;
        while (heap.size() > 0 && count < n) {
            int[] top = heap.pop(); int cost = top[0], i = top[1];
            if (inMST[i]) continue;
            inMST[i] = true;
            total += cost;
            count++;
            for (int j = 0; j < n; j++) {
                if (!inMST[j]) {
                    int d = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
                    heap.push(new int[] { d, j });
                }
            }
        }
        return total;
    }
}
