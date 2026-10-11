static const int DIRS[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
static int** heights;
static int rows, cols;

static void dfs(int r, int c, bool* ocean, int prev) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (ocean[r * cols + c] || heights[r][c] < prev) return;
    ocean[r * cols + c] = true;
    for (int d = 0; d < 4; d++) dfs(r + DIRS[d][0], c + DIRS[d][1], ocean, heights[r][c]);
}

int** pacificAtlantic(int** heightsIn, int heightsSize, int* heightsColSize, int* returnSize, int** returnColumnSizes) {
    heights = heightsIn;
    rows = heightsSize;
    cols = heightsColSize[0];
    bool* pac = calloc(rows * cols, sizeof(bool));
    bool* atl = calloc(rows * cols, sizeof(bool));
    for (int r = 0; r < rows; r++) {
        dfs(r, 0, pac, INT_MIN);
        dfs(r, cols - 1, atl, INT_MIN);
    }
    for (int c = 0; c < cols; c++) {
        dfs(0, c, pac, INT_MIN);
        dfs(rows - 1, c, atl, INT_MIN);
    }
    int** res = malloc(rows * cols * sizeof(int*));
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (pac[r * cols + c] && atl[r * cols + c]) {
                res[count] = malloc(2 * sizeof(int));
                res[count][0] = r;
                res[count++][1] = c;
            }
        }
    }
    free(pac);
    free(atl);
    *returnSize = count;
    *returnColumnSizes = malloc((count ? count : 1) * sizeof(int));
    for (int i = 0; i < count; i++) (*returnColumnSizes)[i] = 2;
    return res;
}
