class Solution {
    private final Map<String, List<Map.Entry<String, Double>>> graph = new HashMap<>();

    public double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
        for (int i = 0; i < equations.size(); i++) {
            String a = equations.get(i).get(0), b = equations.get(i).get(1);
            addEdge(a, b, values[i]);
            addEdge(b, a, 1 / values[i]);
        }
        double[] res = new double[queries.size()];
        for (int q = 0; q < res.length; q++) {
            res[q] = dfs(queries.get(q).get(0), queries.get(q).get(1), new HashSet<>());
        }
        return res;
    }

    private void addEdge(String a, String b, double w) {
        graph.computeIfAbsent(a, k -> new ArrayList<>()).add(Map.entry(b, w));
    }

    private double dfs(String src, String dst, Set<String> visited) {
        if (!graph.containsKey(src) || !graph.containsKey(dst)) return -1;
        if (src.equals(dst)) return 1;
        visited.add(src);
        for (Map.Entry<String, Double> edge : graph.get(src)) {
            if (!visited.contains(edge.getKey())) {
                double sub = dfs(edge.getKey(), dst, visited);
                if (sub != -1) return edge.getValue() * sub;
            }
        }
        return -1;
    }
}
