struct Visited { struct Node* original; struct Node* copy; UT_hash_handle hh; };
static struct Visited* visited;

static struct Node* dfs(struct Node* curr) {
    struct Visited* found;
    HASH_FIND_PTR(visited, &curr, found);
    if (found) return found->copy;
    struct Node* copy = malloc(sizeof(struct Node));
    copy->val = curr->val;
    copy->numNeighbors = curr->numNeighbors;
    copy->neighbors = malloc((curr->numNeighbors ? curr->numNeighbors : 1) * sizeof(struct Node*));
    found = malloc(sizeof *found);
    found->original = curr;
    found->copy = copy;
    HASH_ADD_PTR(visited, original, found);
    for (int i = 0; i < curr->numNeighbors; i++) {
        copy->neighbors[i] = dfs(curr->neighbors[i]);
    }
    return copy;
}

struct Node* cloneGraph(struct Node* s) {
    if (!s) return NULL;
    visited = NULL;
    struct Node* copy = dfs(s);
    struct Visited *entry, *tmp;
    HASH_ITER(hh, visited, entry, tmp) { HASH_DEL(visited, entry); free(entry); }
    return copy;
}
