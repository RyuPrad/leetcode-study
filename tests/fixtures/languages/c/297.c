static void write(struct TreeNode* node, char** p) {
    if (!node) { *p += sprintf(*p, "#,"); return; }
    *p += sprintf(*p, "%d,", node->val);
    write(node->left, p); write(node->right, p);
}
/** Encodes a tree to a single string. */
char* serialize(struct TreeNode* root) {
    char* out = malloc(1 << 20), *p = out; *p = 0;
    write(root, &p);
    return out;
}
static struct TreeNode* read(char** p) {
    if (**p == '#') { *p += 2; return NULL; }
    struct TreeNode* node = malloc(sizeof *node);
    node->val = (int)strtol(*p, p, 10); (*p)++;
    node->left = read(p); node->right = read(p);
    return node;
}
/** Decodes your encoded data to tree. */
struct TreeNode* deserialize(char* data) {
    return read(&data);
}
