struct ListNode* insertionSortList(struct ListNode* head) {
    struct ListNode dummy = {0, NULL};
    struct ListNode* curr = head;
    while (curr) {
        struct ListNode* next = curr->next;
        struct ListNode* prev = &dummy;
        while (prev->next && prev->next->val < curr->val) {
            prev = prev->next;
        }
        curr->next = prev->next;
        prev->next = curr;
        curr = next;
    }
    return dummy.next;
}
