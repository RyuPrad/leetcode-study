struct ListNode** splitListToParts(struct ListNode* head, int k, int* returnSize) {
    int length = 0;
    for (struct ListNode* node = head; node; node = node->next) {
        length++;
    }
    int size = length / k, extra = length % k;
    struct ListNode** res = calloc(k, sizeof(struct ListNode*));
    struct ListNode* curr = head;
    for (int i = 0; i < k && curr; i++) {
        res[i] = curr;
        int partSize = size + (i < extra ? 1 : 0);
        for (int j = 1; j < partSize; j++) {
            curr = curr->next;
        }
        struct ListNode* next = curr->next;
        curr->next = NULL;
        curr = next;
    }
    *returnSize = k;
    return res;
}
