static struct ListNode* mergeTwo(struct ListNode* l1, struct ListNode* l2) {
    struct ListNode dummy = { 0, NULL };
    struct ListNode* curr = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) {
            curr->next = l1;
            l1 = l1->next;
        } else {
            curr->next = l2;
            l2 = l2->next;
        }
        curr = curr->next;
    }
    curr->next = l1 ? l1 : l2;
    return dummy.next;
}

struct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {
    if (listsSize == 0) return NULL;
    while (listsSize > 1) {
        int merged = 0;
        for (int i = 0; i < listsSize; i += 2) {
            struct ListNode* l1 = lists[i];
            struct ListNode* l2 = i + 1 < listsSize ? lists[i + 1] : NULL;
            lists[merged++] = mergeTwo(l1, l2);
        }
        listsSize = merged;
    }
    return lists[0];
}
