struct ListNode* partition(struct ListNode* head, int x) {
    struct ListNode lessHead = {0, NULL}, moreHead = {0, NULL};
    struct ListNode *less = &lessHead, *more = &moreHead;
    while (head) {
        if (head->val < x) {
            less->next = head;
            less = head;
        } else {
            more->next = head;
            more = head;
        }
        head = head->next;
    }
    more->next = NULL;
    less->next = moreHead.next;
    return lessHead.next;
}
