static int* parent;
static int count;
static int (*indexed)[4];
static int edgeCount, nodes;

static int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

static bool unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;
    parent[ra] = rb;
    count--;
    return true;
}

static int buildMST(int skip, int force) {
    for (int i = 0; i < nodes; i++) parent[i] = i;
    count = nodes;
    int weight = 0;
    if (force != -1) { unite(indexed[force][0], indexed[force][1]); weight += indexed[force][2]; }
    for (int i = 0; i < edgeCount; i++) {
        if (i == skip) continue;
        if (unite(indexed[i][0], indexed[i][1])) weight += indexed[i][2];
    }
    return count == 1 ? weight : INT_MAX;
}

static int byWeight(const void* a, const void* b) {
    const int* x = a; const int* y = b;
    // Stable on equal weights, like JavaScript's sort.
    return x[2] != y[2] ? (x[2] > y[2]) - (x[2] < y[2]) : (x[3] > y[3]) - (x[3] < y[3]);
}

int** findCriticalAndPseudoCriticalEdges(int n, int** edges, int edgesSize, int* edgesColSize, int* returnSize, int** returnColumnSizes) {
    nodes = n;
    edgeCount = edgesSize;
    parent = malloc(n * sizeof(int));
    indexed = malloc(edgesSize * sizeof *indexed);
    for (int i = 0; i < edgesSize; i++) { indexed[i][0] = edges[i][0]; indexed[i][1] = edges[i][1]; indexed[i][2] = edges[i][2]; indexed[i][3] = i; }
    qsort(indexed, edgesSize, sizeof *indexed, byWeight);
    int mstWeight = buildMST(-1, -1);
    int** res = malloc(2 * sizeof(int*));
    res[0] = malloc((edgesSize ? edgesSize : 1) * sizeof(int));
    res[1] = malloc((edgesSize ? edgesSize : 1) * sizeof(int));
    *returnColumnSizes = calloc(2, sizeof(int));
    for (int i = 0; i < edgesSize; i++) {
        if (buildMST(i, -1) > mstWeight) res[0][(*returnColumnSizes)[0]++] = indexed[i][3];
        else if (buildMST(-1, i) == mstWeight) res[1][(*returnColumnSizes)[1]++] = indexed[i][3];
    }
    free(parent);
    free(indexed);
    *returnSize = 2;
    return res;
}
