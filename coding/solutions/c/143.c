void reorderList(struct ListNode* head) {
    if (!head || !head->next) return;
    struct ListNode* slow = head;
    struct ListNode* fast = head;
    while (fast->next && fast->next->next) {
        slow = slow->next;
        fast = fast->next->next;
    }

    struct ListNode* second = slow->next;
    slow->next = NULL;

    struct ListNode* prev = NULL;
    struct ListNode* curr = second;
    while (curr) {
        struct ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }

    struct ListNode* first = head;
    second = prev;
    while (second) {
        struct ListNode* temp1 = first->next;
        struct ListNode* temp2 = second->next;
        first->next = second;
        second->next = temp1;
        first = temp1;
        second = temp2;
    }
}
