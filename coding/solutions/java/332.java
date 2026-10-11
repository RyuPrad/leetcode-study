class Solution {
    private final Map<String, PriorityQueue<String>> adj = new HashMap<>();
    private final List<String> res = new ArrayList<>();

    public List<String> findItinerary(List<List<String>> tickets) {
        for (List<String> ticket : tickets) {
            adj.computeIfAbsent(ticket.get(0), k -> new PriorityQueue<>()).add(ticket.get(1));
        }
        visit("JFK");
        Collections.reverse(res);
        return res;
    }

    private void visit(String airport) {
        PriorityQueue<String> dests = adj.get(airport);
        while (dests != null && !dests.isEmpty()) {
            visit(dests.poll());
        }
        res.add(airport);
    }
}
