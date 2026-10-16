static char* wrap(char* res, char* inner) {
    char* out = malloc(strlen(res) + strlen(inner) + 3);
    sprintf(out, "%s(%s)", res, inner);
    free(res);
    free(inner);
    return out;
}

char* tree2str(struct TreeNode* root) {
    if (!root) {
        return calloc(1, 1);
    }
    char* res = malloc(16);
    sprintf(res, "%d", root->val);
    if (root->left || root->right) {
        res = wrap(res, tree2str(root->left));
    }
    if (root->right) {
        res = wrap(res, tree2str(root->right));
    }
    return res;
}
