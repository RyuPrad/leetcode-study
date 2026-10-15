int maximumDetonation(int** bombs, int bombsSize, int* bombsColSize) {
    int n = bombsSize;
    bool* reach = calloc(n * n, sizeof(bool));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            long long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1];
            long long r = bombs[i][2];
            if (i != j && dx * dx + dy * dy <= r * r) {
                reach[i * n + j] = true;
            }
        }
    }
    bool* visited = malloc(n * sizeof(bool));
    int* stack = malloc(n * sizeof(int));
    int res = 0;
    for (int start = 0; start < n; start++) {
        for (int k = 0; k < n; k++) visited[k] = false;
        visited[start] = true;
        int count = 1, top = 0;
        stack[top++] = start;
        while (top > 0) {
            int bomb = stack[--top];
            for (int next = 0; next < n; next++) {
                if (reach[bomb * n + next] && !visited[next]) {
                    visited[next] = true;
                    count++;
                    stack[top++] = next;
                }
            }
        }
        if (count > res) res = count;
    }
    free(reach);
    free(visited);
    free(stack);
    return res;
}
