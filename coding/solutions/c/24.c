struct ListNode* swapPairs(struct ListNode* head) {
    struct ListNode dummy = {0, head};
    struct ListNode* prev = &dummy;
    while (prev->next && prev->next->next) {
        struct ListNode *first = prev->next, *second = prev->next->next;
        first->next = second->next;
        second->next = first;
        prev->next = second;
        prev = first;
    }
    return dummy.next;
}
