struct ListNode* removeNthFromEnd(struct ListNode* head, int n) {
    struct ListNode dummy = { 0, head };
    struct ListNode* fast = &dummy;
    struct ListNode* slow = &dummy;
    for (int i = 0; i < n; i++) {
        fast = fast->next;
    }
    while (fast->next) {
        fast = fast->next;
        slow = slow->next;
    }
    slow->next = slow->next->next;
    return dummy.next;
}
