long long minimumFuelCost(int** roads, int roadsSize, int* roadsColSize, int seats) {
    int n = roadsSize + 1;
    int* first = calloc(n + 1, sizeof(int));
    for (int i = 0; i < roadsSize; i++) {
        first[roads[i][0] + 1]++;
        first[roads[i][1] + 1]++;
    }
    for (int v = 0; v < n; v++) first[v + 1] += first[v];
    int* fill = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) fill[v] = first[v];
    int* adj = malloc((2 * roadsSize + 1) * sizeof(int));
    for (int i = 0; i < roadsSize; i++) {
        adj[fill[roads[i][0]]++] = roads[i][1];
        adj[fill[roads[i][1]]++] = roads[i][0];
    }
    int* parent = malloc(n * sizeof(int));
    for (int v = 0; v < n; v++) parent[v] = -1;
    parent[0] = 0;
    int* order = malloc(n * sizeof(int));
    int size = 0;
    order[size++] = 0;
    for (int i = 0; i < size; i++) {
        for (int k = first[order[i]]; k < first[order[i] + 1]; k++) {
            int next = adj[k];
            if (parent[next] == -1) {
                parent[next] = order[i];
                order[size++] = next;
            }
        }
    }
    long long* people = malloc(n * sizeof(long long));
    for (int v = 0; v < n; v++) people[v] = 1;
    long long fuel = 0;
    for (int i = n - 1; i > 0; i--) {
        int node = order[i];
        fuel += (people[node] + seats - 1) / seats;
        people[parent[node]] += people[node];
    }
    free(first);
    free(fill);
    free(adj);
    free(parent);
    free(order);
    free(people);
    return fuel;
}
