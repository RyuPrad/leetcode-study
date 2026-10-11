struct Copy { struct Node* original; struct Node* copy; UT_hash_handle hh; };

static struct Node* lookup(struct Copy* map, struct Node* original) {
    struct Copy* found;
    if (!original) return NULL;
    HASH_FIND_PTR(map, &original, found);
    return found->copy;
}

struct Node* copyRandomList(struct Node* head) {
    if (!head) return NULL;
    struct Copy *map = NULL, *entry, *tmp;
    struct Node* curr = head;
    while (curr) {
        entry = malloc(sizeof *entry);
        entry->original = curr;
        entry->copy = malloc(sizeof(struct Node));
        entry->copy->val = curr->val;
        HASH_ADD_PTR(map, original, entry);
        curr = curr->next;
    }
    curr = head;
    while (curr) {
        struct Node* copy = lookup(map, curr);
        copy->next = lookup(map, curr->next);
        copy->random = lookup(map, curr->random);
        curr = curr->next;
    }
    struct Node* result = lookup(map, head);
    HASH_ITER(hh, map, entry, tmp) { HASH_DEL(map, entry); free(entry); }
    return result;
}
