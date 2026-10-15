int shortestBridge(int** grid, int gridSize, int* gridColSize) {
    int n = gridSize;
    int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    int sr = -1, sc = -1;
    for (int r = 0; r < n && sr < 0; r++) {
        for (int c = 0; c < n && sr < 0; c++) {
            if (grid[r][c] == 1) {
                sr = r;
                sc = c;
            }
        }
    }
    int* queue = malloc(2 * n * n * sizeof(int));
    int* next = malloc(2 * n * n * sizeof(int));
    int* stack = malloc(2 * n * n * sizeof(int));
    int size = 0, top = 0;
    stack[top++] = sr;
    stack[top++] = sc;
    grid[sr][sc] = 2;
    while (top > 0) {
        int x = stack[--top], y = stack[--top];
        queue[size++] = y;
        queue[size++] = x;
        for (int d = 0; d < 4; d++) {
            int ny = y + dirs[d][0], nx = x + dirs[d][1];
            if (ny >= 0 && ny < n && nx >= 0 && nx < n && grid[ny][nx] == 1) {
                grid[ny][nx] = 2;
                stack[top++] = ny;
                stack[top++] = nx;
            }
        }
    }
    int distance = 0, res = -1;
    while (size > 0 && res < 0) {
        int nextSize = 0;
        for (int i = 0; i < size && res < 0; i += 2) {
            for (int d = 0; d < 4; d++) {
                int ny = queue[i] + dirs[d][0], nx = queue[i + 1] + dirs[d][1];
                if (ny < 0 || ny >= n || nx < 0 || nx >= n || grid[ny][nx] == 2) {
                    continue;
                }
                if (grid[ny][nx] == 1) {
                    res = distance;
                    break;
                }
                grid[ny][nx] = 2;
                next[nextSize++] = ny;
                next[nextSize++] = nx;
            }
        }
        int* swap = queue;
        queue = next;
        next = swap;
        size = nextSize;
        distance++;
    }
    free(queue);
    free(next);
    free(stack);
    return res;
}
