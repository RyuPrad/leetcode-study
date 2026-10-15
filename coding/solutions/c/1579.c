static int find(int* parent, int x) {
    return parent[x] == x ? x : (parent[x] = find(parent, parent[x]));
}

static bool unite(int* parent, int a, int b) {
    int ra = find(parent, a), rb = find(parent, b);
    if (ra == rb) {
        return false;
    }
    parent[ra] = rb;
    return true;
}

static int byTypeDescending(const void* x, const void* y) {
    return (*(const int**) y)[0] - (*(const int**) x)[0];
}

int maxNumEdgesToRemove(int n, int** edges, int edgesSize, int* edgesColSize) {
    int* alice = malloc((n + 1) * sizeof(int));
    int* bob = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) {
        alice[i] = i;
        bob[i] = i;
    }
    int used = 0, aliceParts = n, bobParts = n;
    qsort(edges, edgesSize, sizeof(int*), byTypeDescending);
    for (int e = 0; e < edgesSize; e++) {
        int type = edges[e][0], a = edges[e][1], b = edges[e][2];
        bool useful = false;
        if (type != 2 && unite(alice, a, b)) {
            aliceParts--;
            useful = true;
        }
        if (type != 1 && unite(bob, a, b)) {
            bobParts--;
            useful = true;
        }
        if (useful) {
            used++;
        }
    }
    free(alice);
    free(bob);
    return aliceParts == 1 && bobParts == 1 ? edgesSize - used : -1;
}
