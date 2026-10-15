bool isPalindrome(struct ListNode* head) {
    struct ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    struct ListNode* prev = NULL;
    while (slow) {
        struct ListNode* next = slow->next;
        slow->next = prev;
        prev = slow;
        slow = next;
    }
    struct ListNode *left = head, *right = prev;
    while (right) {
        if (left->val != right->val) {
            return false;
        }
        left = left->next;
        right = right->next;
    }
    return true;
}
