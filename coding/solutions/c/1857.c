int largestPathValue(char* colors, int** edges, int edgesSize, int* edgesColSize) {
    int n = strlen(colors);
    int* first = calloc(n + 1, sizeof(int));
    int* indegree = calloc(n, sizeof(int));
    for (int i = 0; i < edgesSize; i++) {
        first[edges[i][0] + 1]++;
        indegree[edges[i][1]]++;
    }
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* adj = malloc((edgesSize + 1) * sizeof(int));
    for (int i = 0; i < edgesSize; i++) {
        adj[fill[edges[i][0]]++] = edges[i][1];
    }
    int (*count)[26] = calloc(n, sizeof(*count));
    int* queue = malloc(n * sizeof(int));
    int size = 0;
    for (int node = 0; node < n; node++) {
        if (indegree[node] == 0) {
            queue[size++] = node;
        }
    }
    int res = 0;
    for (int head = 0; head < size; head++) {
        int node = queue[head];
        int own = colors[node] - 'a';
        count[node][own]++;
        if (count[node][own] > res) res = count[node][own];
        for (int e = first[node]; e < first[node + 1]; e++) {
            int next = adj[e];
            for (int k = 0; k < 26; k++) {
                if (count[node][k] > count[next][k]) count[next][k] = count[node][k];
            }
            indegree[next]--;
            if (indegree[next] == 0) {
                queue[size++] = next;
            }
        }
    }
    int answer = size == n ? res : -1;
    free(first);
    free(indegree);
    free(fill);
    free(adj);
    free(count);
    free(queue);
    return answer;
}
