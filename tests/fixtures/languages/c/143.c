void reorderList(struct ListNode* head) {
    if (!head) return;
    struct ListNode *slow = head, *fast = head;
    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
    struct ListNode *prev = NULL, *curr = slow->next; slow->next = NULL;
    while (curr) { struct ListNode* next = curr->next; curr->next = prev; prev = curr; curr = next; }
    for (struct ListNode *first = head, *second = prev; second;) {
        struct ListNode *a = first->next, *b = second->next;
        first->next = second; second->next = a; first = a; second = b;
    }
}
