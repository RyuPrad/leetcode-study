// Variables are numbered by first appearance; edges are kept per variable in insertion order.
static char* names[64];
static int nameCount;
static int edgeTo[64][64];
static double edgeWeight[64][64];
static int edgeCount[64];

static int idOf(const char* name) {
    for (int i = 0; i < nameCount; i++) if (strcmp(names[i], name) == 0) return i;
    return -1;
}

static int intern(char* name) {
    int id = idOf(name);
    if (id >= 0) return id;
    names[nameCount] = name;
    edgeCount[nameCount] = 0;
    return nameCount++;
}

static double dfs(int src, int dst, bool* visited) {
    if (src == dst) return 1;
    visited[src] = true;
    for (int k = 0; k < edgeCount[src]; k++) {
        int nei = edgeTo[src][k];
        if (!visited[nei]) {
            double sub = dfs(nei, dst, visited);
            if (sub != -1) return edgeWeight[src][k] * sub;
        }
    }
    return -1;
}

double* calcEquation(char*** equations, int equationsSize, int* equationsColSize, double* values, int valuesSize, char*** queries, int queriesSize, int* queriesColSize, int* returnSize) {
    nameCount = 0;
    for (int i = 0; i < equationsSize; i++) {
        int a = intern(equations[i][0]), b = intern(equations[i][1]);
        edgeTo[a][edgeCount[a]] = b; edgeWeight[a][edgeCount[a]++] = values[i];
        edgeTo[b][edgeCount[b]] = a; edgeWeight[b][edgeCount[b]++] = 1 / values[i];
    }
    double* res = malloc((queriesSize ? queriesSize : 1) * sizeof(double));
    for (int q = 0; q < queriesSize; q++) {
        int a = idOf(queries[q][0]), b = idOf(queries[q][1]);
        bool visited[64] = { false };
        res[q] = a < 0 || b < 0 ? -1 : dfs(a, b, visited);
    }
    *returnSize = queriesSize;
    return res;
}
