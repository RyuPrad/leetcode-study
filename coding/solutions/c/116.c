struct Node* connect(struct Node* root) {
    struct Node* leftmost = root;
    while (leftmost && leftmost->left) {
        for (struct Node* node = leftmost; node; node = node->next) {
            node->left->next = node->right;
            if (node->next) {
                node->right->next = node->next->left;
            }
        }
        leftmost = leftmost->left;
    }
    return root;
}
