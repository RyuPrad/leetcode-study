class Solution {
    public ListNode insertGreatestCommonDivisors(ListNode head) {
        ListNode curr = head;
        while (curr.next != null) {
            ListNode node = new ListNode(gcd(curr.val, curr.next.val));
            node.next = curr.next;
            curr.next = node;
            curr = node.next;
        }
        return head;
    }

    private int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }
}
