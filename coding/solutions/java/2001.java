class Solution {
    public long interchangeableRectangles(int[][] rectangles) {
        Map<String, Integer> count = new HashMap<>();
        long res = 0;
        for (int[] rectangle : rectangles) {
            int w = rectangle[0], h = rectangle[1];
            int g = gcd(w, h);
            String key = w / g + ":" + h / g;
            res += count.getOrDefault(key, 0);
            count.put(key, count.getOrDefault(key, 0) + 1);
        }
        return res;
    }

    private int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }
}
