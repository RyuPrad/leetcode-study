struct ListNode* rotateRight(struct ListNode* head, int k) {
    if (!head) {
        return head;
    }
    int length = 1;
    struct ListNode* tail = head;
    while (tail->next) {
        tail = tail->next;
        length++;
    }
    k %= length;
    if (k == 0) {
        return head;
    }
    struct ListNode* newTail = head;
    for (int i = 1; i < length - k; i++) {
        newTail = newTail->next;
    }
    struct ListNode* newHead = newTail->next;
    newTail->next = NULL;
    tail->next = head;
    return newHead;
}
