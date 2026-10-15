struct ListNode* swapNodes(struct ListNode* head, int k) {
    struct ListNode* fast = head;
    for (int i = 1; i < k; i++) {
        fast = fast->next;
    }
    struct ListNode* first = fast;
    struct ListNode* slow = head;
    while (fast->next) {
        slow = slow->next;
        fast = fast->next;
    }
    int temp = first->val;
    first->val = slow->val;
    slow->val = temp;
    return head;
}
