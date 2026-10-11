static int* parent;
static int count;

static int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

static void unite(int a, int b) {
    int ra = find(a);
    int rb = find(b);
    if (ra != rb) {
        parent[ra] = rb;
        count--;
    }
}

int countComponents(int n, int** edges, int edgesSize, int* edgesColSize) {
    parent = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) parent[i] = i;
    count = n;
    for (int e = 0; e < edgesSize; e++) unite(edges[e][0], edges[e][1]);
    free(parent);
    return count;
}
