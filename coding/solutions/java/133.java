/*
// Definition for a Node.
class Node {
    public int val;
    public List<Node> neighbors;
}
*/
class Solution {
    private final Map<Node, Node> visited = new HashMap<>();

    public Node cloneGraph(Node node) {
        if (node == null) return null;
        return dfs(node);
    }

    private Node dfs(Node curr) {
        if (visited.containsKey(curr)) return visited.get(curr);
        Node copy = new Node(curr.val);
        visited.put(curr, copy);
        for (Node nei : curr.neighbors) {
            copy.neighbors.add(dfs(nei));
        }
        return copy;
    }
}
