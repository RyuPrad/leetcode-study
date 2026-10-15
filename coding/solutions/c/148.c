struct ListNode* sortList(struct ListNode* head) {
    if (!head || !head->next) {
        return head;
    }
    struct ListNode *slow = head, *fast = head->next;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    struct ListNode* right = slow->next;
    slow->next = NULL;
    struct ListNode* a = sortList(head);
    struct ListNode* b = sortList(right);
    struct ListNode dummy = {0, NULL};
    struct ListNode* tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) {
            tail->next = a;
            a = a->next;
        } else {
            tail->next = b;
            b = b->next;
        }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}
