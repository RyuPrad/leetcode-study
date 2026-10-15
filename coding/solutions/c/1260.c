int** shiftGrid(int** grid, int gridSize, int* gridColSize, int k, int* returnSize, int** returnColumnSizes) {
    int m = gridSize, n = gridColSize[0], total = m * n;
    int** res = malloc(m * sizeof(int*));
    *returnColumnSizes = malloc(m * sizeof(int));
    for (int r = 0; r < m; r++) {
        res[r] = malloc(n * sizeof(int));
        (*returnColumnSizes)[r] = n;
    }
    *returnSize = m;
    for (int i = 0; i < total; i++) {
        int target = (i + k) % total;
        res[target / n][target % n] = grid[i / n][i % n];
    }
    return res;
}
