struct Node* copies[101];
static struct Node* visit(struct Node* node) {
    if (copies[node->val]) return copies[node->val];
    struct Node* copy = malloc(sizeof *copy);
    copy->val = node->val; copy->numNeighbors = node->numNeighbors;
    copy->neighbors = malloc((node->numNeighbors ? node->numNeighbors : 1) * sizeof(struct Node*));
    copies[node->val] = copy;
    for (int i = 0; i < node->numNeighbors; i++) copy->neighbors[i] = visit(node->neighbors[i]);
    return copy;
}
struct Node* cloneGraph(struct Node* s) {
    return s ? visit(s) : NULL;
}
