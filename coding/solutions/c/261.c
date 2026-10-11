static int* parent;

static int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

static bool unite(int a, int b) {
    int ra = find(a);
    int rb = find(b);
    if (ra == rb) return false;
    parent[ra] = rb;
    return true;
}

bool validTree(int n, int** edges, int edgesSize, int* edgesColSize) {
    if (edgesSize != n - 1) return false;
    parent = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) parent[i] = i;
    bool valid = true;
    for (int e = 0; e < edgesSize && valid; e++) {
        if (!unite(edges[e][0], edges[e][1])) valid = false;
    }
    free(parent);
    return valid;
}
