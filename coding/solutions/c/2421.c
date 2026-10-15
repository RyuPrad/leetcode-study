static int* parent;
static int* values;

static int find(int x) {
    return parent[x] == x ? x : (parent[x] = find(parent[x]));
}

static int byValue(const void* a, const void* b) {
    return values[*(const int*) a] - values[*(const int*) b];
}

int numberOfGoodPaths(int* vals, int valsSize, int** edges, int edgesSize, int* edgesColSize) {
    int n = valsSize;
    parent = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) {
        parent[v] = v;
    }
    int* first = calloc(n + 1, sizeof(int));
    for (int e = 0; e < edgesSize; e++) {
        first[edges[e][0] + 1]++;
        first[edges[e][1] + 1]++;
    }
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* adj = malloc((2 * edgesSize + 1) * sizeof(int));
    for (int e = 0; e < edgesSize; e++) {
        adj[fill[edges[e][0]]++] = edges[e][1];
        adj[fill[edges[e][1]]++] = edges[e][0];
    }
    int* order = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) {
        order[v] = v;
    }
    values = vals;
    qsort(order, n, sizeof(int), byValue);
    int* count = calloc(n, sizeof(int));
    int res = 0, i = 0;
    while (i < n) {
        int j = i;
        while (j < n && vals[order[j]] == vals[order[i]]) {
            int node = order[j];
            for (int k = first[node]; k < first[node + 1]; k++) {
                if (vals[adj[k]] <= vals[node]) {
                    parent[find(adj[k])] = find(node);
                }
            }
            j++;
        }
        for (int k = i; k < j; k++) {
            int root = find(order[k]);
            count[root]++;
            res += count[root];
        }
        for (int k = i; k < j; k++) {
            count[find(order[k])] = 0;
        }
        i = j;
    }
    free(parent);
    free(first);
    free(fill);
    free(adj);
    free(order);
    free(count);
    return res;
}
