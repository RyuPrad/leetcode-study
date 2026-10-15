class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode lessHead = new ListNode(0), moreHead = new ListNode(0);
        ListNode less = lessHead, more = moreHead;
        while (head != null) {
            if (head.val < x) {
                less.next = head;
                less = head;
            } else {
                more.next = head;
                more = head;
            }
            head = head.next;
        }
        more.next = null;
        less.next = moreHead.next;
        return lessHead.next;
    }
}
