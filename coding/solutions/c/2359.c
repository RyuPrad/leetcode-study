static int* distances(int* edges, int n, int start) {
    int* dist = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) dist[i] = -1;
    int node = start, d = 0;
    while (node != -1 && dist[node] == -1) {
        dist[node] = d++;
        node = edges[node];
    }
    return dist;
}

int closestMeetingNode(int* edges, int edgesSize, int node1, int node2) {
    int* d1 = distances(edges, edgesSize, node1);
    int* d2 = distances(edges, edgesSize, node2);
    int res = -1, best = INT_MAX;
    for (int node = 0; node < edgesSize; node++) {
        int far = d1[node] > d2[node] ? d1[node] : d2[node];
        if (d1[node] != -1 && d2[node] != -1 && far < best) {
            best = far;
            res = node;
        }
    }
    free(d1);
    free(d2);
    return res;
}
