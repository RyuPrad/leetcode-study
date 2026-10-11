static int* parent;
static int* rank;

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
    if (rank[ra] < rank[rb]) {
        parent[ra] = rb;
    } else if (rank[ra] > rank[rb]) {
        parent[rb] = ra;
    } else {
        parent[rb] = ra;
        rank[ra]++;
    }
    return true;
}

int* findRedundantConnection(int** edges, int edgesSize, int* edgesColSize, int* returnSize) {
    int n = edgesSize;
    parent = malloc((n + 1) * sizeof(int));
    rank = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) { parent[i] = i; rank[i] = 1; }
    int* res = malloc(2 * sizeof(int));
    *returnSize = 0;
    for (int e = 0; e < edgesSize; e++) {
        if (!unite(edges[e][0], edges[e][1])) {
            res[0] = edges[e][0];
            res[1] = edges[e][1];
            *returnSize = 2;
            break;
        }
    }
    free(parent);
    free(rank);
    return res;
}
