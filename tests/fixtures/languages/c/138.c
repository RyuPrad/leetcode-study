struct Node* copyRandomList(struct Node* head) {
    for (struct Node* n = head; n; n = n->next->next) {
        struct Node* copy = malloc(sizeof *copy);
        copy->val = n->val; copy->next = n->next; copy->random = NULL; n->next = copy;
    }
    for (struct Node* n = head; n; n = n->next->next) n->next->random = n->random ? n->random->next : NULL;
    struct Node dummy, *tail = &dummy;
    for (struct Node* n = head; n; n = n->next) { tail->next = n->next; tail = tail->next; n->next = tail->next; }
    tail->next = NULL;
    return dummy.next;
}
