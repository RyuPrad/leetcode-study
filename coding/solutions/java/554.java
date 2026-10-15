class Solution {
    public int leastBricks(List<List<Integer>> wall) {
        Map<Integer, Integer> edges = new HashMap<>();
        int best = 0;
        for (List<Integer> row : wall) {
            int position = 0;
            for (int i = 0; i < row.size() - 1; i++) {
                position += row.get(i);
                edges.put(position, edges.getOrDefault(position, 0) + 1);
                best = Math.max(best, edges.get(position));
            }
        }
        return wall.size() - best;
    }
}
