static void write(struct TreeNode* node, char** end) {
    if (!node) { *end += sprintf(*end, "null,"); return; }
    *end += sprintf(*end, "%d,", node->val);
    write(node->left, end);
    write(node->right, end);
}

static int countNodes(struct TreeNode* node) {
    return node ? 1 + countNodes(node->left) + countNodes(node->right) : 0;
}

/** Encodes a tree to a single string. */
char* serialize(struct TreeNode* root) {
    char* data = malloc(13 * (2 * countNodes(root) + 1) + 1);
    char* end = data;
    *end = '\0';
    write(root, &end);
    if (end > data) end[-1] = '\0'; // drop the trailing comma
    return data;
}

static struct TreeNode* read(char** p) {
    if (strncmp(*p, "null", 4) == 0) {
        *p += 4;
        if (**p == ',') (*p)++;
        return NULL;
    }
    struct TreeNode* node = malloc(sizeof(struct TreeNode));
    node->val = (int)strtol(*p, p, 10);
    if (**p == ',') (*p)++;
    node->left = read(p);
    node->right = read(p);
    return node;
}

/** Decodes your encoded data to tree. */
struct TreeNode* deserialize(char* data) {
    return read(&data);
}
