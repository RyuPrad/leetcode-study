class Solution {
    public Node copyRandomList(Node head) {
        Map<Node, Node> copies = new HashMap<>();
        for (Node n = head; n != null; n = n.next) copies.put(n, new Node(n.val));
        for (Node n = head; n != null; n = n.next) { copies.get(n).next = copies.get(n.next); copies.get(n).random = copies.get(n.random); }
        return copies.get(head);
    }
}
