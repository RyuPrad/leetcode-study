/*
// Definition for a Node.
class Node {
    int val;
    Node next;
    Node random;
}
*/
class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        Map<Node, Node> map = new HashMap<>();
        Node curr = head;
        while (curr != null) {
            map.put(curr, new Node(curr.val));
            curr = curr.next;
        }
        curr = head;
        while (curr != null) {
            map.get(curr).next = curr.next != null ? map.get(curr.next) : null;
            map.get(curr).random = curr.random != null ? map.get(curr.random) : null;
            curr = curr.next;
        }
        return map.get(head);
    }
}
