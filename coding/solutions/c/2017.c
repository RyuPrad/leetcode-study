long long gridGame(int** grid, int gridSize, int* gridColSize) {
    int n = gridColSize[0];
    long long top = 0, bottom = 0, res = LLONG_MAX;
    for (int k = 0; k < n; k++) top += grid[0][k];
    for (int i = 0; i < n; i++) {
        top -= grid[0][i];
        long long second = top > bottom ? top : bottom;
        if (second < res) res = second;
        bottom += grid[1][i];
    }
    return res;
}
