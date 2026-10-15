int pairSum(struct ListNode* head) {
    struct ListNode *slow = head, *fast = head, *prev = NULL;
    while (fast) {
        fast = fast->next->next;
        struct ListNode* next = slow->next;
        slow->next = prev;
        prev = slow;
        slow = next;
    }
    int res = 0;
    while (slow) {
        if (prev->val + slow->val > res) res = prev->val + slow->val;
        prev = prev->next;
        slow = slow->next;
    }
    return res;
}
