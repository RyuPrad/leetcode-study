class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) return null;
        List<ListNode> current = new ArrayList<>(Arrays.asList(lists));
        while (current.size() > 1) {
            List<ListNode> merged = new ArrayList<>();
            for (int i = 0; i < current.size(); i += 2) {
                ListNode l1 = current.get(i);
                ListNode l2 = i + 1 < current.size() ? current.get(i + 1) : null;
                merged.add(mergeTwo(l1, l2));
            }
            current = merged;
        }
        return current.get(0);
    }

    private ListNode mergeTwo(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                curr.next = l1;
                l1 = l1.next;
            } else {
                curr.next = l2;
                l2 = l2.next;
            }
            curr = curr.next;
        }
        curr.next = l1 != null ? l1 : l2;
        return dummy.next;
    }
}
