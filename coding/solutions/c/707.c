typedef struct {
    struct ListNode* dummy;
    int size;
} MyLinkedList;

void myLinkedListAddAtIndex(MyLinkedList* obj, int index, int val);

MyLinkedList* myLinkedListCreate() {
    MyLinkedList* obj = malloc(sizeof(MyLinkedList));
    obj->dummy = calloc(1, sizeof(struct ListNode));
    obj->size = 0;
    return obj;
}

int myLinkedListGet(MyLinkedList* obj, int index) {
    if (index < 0 || index >= obj->size) {
        return -1;
    }
    struct ListNode* curr = obj->dummy->next;
    for (int i = 0; i < index; i++) {
        curr = curr->next;
    }
    return curr->val;
}

void myLinkedListAddAtHead(MyLinkedList* obj, int val) {
    myLinkedListAddAtIndex(obj, 0, val);
}

void myLinkedListAddAtTail(MyLinkedList* obj, int val) {
    myLinkedListAddAtIndex(obj, obj->size, val);
}

void myLinkedListAddAtIndex(MyLinkedList* obj, int index, int val) {
    if (index > obj->size) {
        return;
    }
    struct ListNode* prev = obj->dummy;
    for (int i = 0; i < index; i++) {
        prev = prev->next;
    }
    struct ListNode* node = malloc(sizeof(struct ListNode));
    node->val = val;
    node->next = prev->next;
    prev->next = node;
    obj->size++;
}

void myLinkedListDeleteAtIndex(MyLinkedList* obj, int index) {
    if (index < 0 || index >= obj->size) {
        return;
    }
    struct ListNode* prev = obj->dummy;
    for (int i = 0; i < index; i++) {
        prev = prev->next;
    }
    struct ListNode* gone = prev->next;
    prev->next = gone->next;
    free(gone);
    obj->size--;
}

void myLinkedListFree(MyLinkedList* obj) {
    struct ListNode* node = obj->dummy;
    while (node) {
        struct ListNode* next = node->next;
        free(node);
        node = next;
    }
    free(obj);
}
