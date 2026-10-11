static int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}

struct ListNode* insertGreatestCommonDivisors(struct ListNode* head) {
    struct ListNode* curr = head;
    while (curr->next) {
        struct ListNode* node = malloc(sizeof(struct ListNode));
        node->val = gcd(curr->val, curr->next->val);
        node->next = curr->next;
        curr->next = node;
        curr = node->next;
    }
    return head;
}
