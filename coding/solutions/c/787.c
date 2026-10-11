int findCheapestPrice(int n, int** flights, int flightsSize, int* flightsColSize, int src, int dst, int k) {
    const int INF = INT_MAX;
    int* dist = malloc(n * sizeof(int));
    int* tmp = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) dist[i] = INF;
    dist[src] = 0;
    for (int i = 0; i <= k; i++) {
        memcpy(tmp, dist, n * sizeof(int));
        for (int f = 0; f < flightsSize; f++) {
            int u = flights[f][0], v = flights[f][1], w = flights[f][2];
            if (dist[u] != INF && dist[u] + w < tmp[v]) tmp[v] = dist[u] + w;
        }
        int* swap = dist; dist = tmp; tmp = swap;
    }
    int result = dist[dst] == INF ? -1 : dist[dst];
    free(dist);
    free(tmp);
    return result;
}
