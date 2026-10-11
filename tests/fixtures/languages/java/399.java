class Solution {
    public double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
        Map<String, Map<String, Double>> graph = new HashMap<>();
        for (int i = 0; i < values.length; i++) {
            String a = equations.get(i).get(0), b = equations.get(i).get(1);
            graph.computeIfAbsent(a, k -> new HashMap<>()).put(b, values[i]);
            graph.computeIfAbsent(b, k -> new HashMap<>()).put(a, 1 / values[i]);
        }
        double[] out = new double[queries.size()];
        for (int q = 0; q < out.length; q++) out[q] = search(graph, queries.get(q).get(0), queries.get(q).get(1), new HashSet<>());
        return out;
    }
    private double search(Map<String, Map<String, Double>> graph, String from, String to, Set<String> seen) {
        if (!graph.containsKey(from) || !graph.containsKey(to)) return -1.0;
        if (from.equals(to)) return 1.0;
        seen.add(from);
        for (Map.Entry<String, Double> edge : graph.get(from).entrySet()) {
            if (seen.contains(edge.getKey())) continue;
            double rest = search(graph, edge.getKey(), to, seen);
            if (rest != -1.0) return edge.getValue() * rest;
        }
        return -1.0;
    }
}
