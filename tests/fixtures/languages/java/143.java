class Solution {
    public void reorderList(ListNode head) {
        List<ListNode> nodes = new ArrayList<>();
        for (ListNode n = head; n != null; n = n.next) nodes.add(n);
        int i = 0, j = nodes.size() - 1;
        while (i < j) { nodes.get(i).next = nodes.get(j); i++; if (i == j) break; nodes.get(j).next = nodes.get(i); j--; }
        if (!nodes.isEmpty()) nodes.get(i).next = null;
    }
}
