static struct Node* make(int** grid, int r, int c, int n) {
    struct Node* node = malloc(sizeof *node);
    bool same = true;
    for (int i = r; i < r + n && same; i++) for (int j = c; j < c + n; j++) if (grid[i][j] != grid[r][c]) { same = false; break; }
    node->val = grid[r][c]; node->isLeaf = same;
    node->topLeft = node->topRight = node->bottomLeft = node->bottomRight = NULL;
    if (!same) {
        int h = n / 2;
        node->topLeft = make(grid, r, c, h); node->topRight = make(grid, r, c + h, h);
        node->bottomLeft = make(grid, r + h, c, h); node->bottomRight = make(grid, r + h, c + h, h);
    }
    return node;
}
struct Node* construct(int** grid, int gridSize, int* gridColSize) {
    return make(grid, 0, 0, gridSize);
}
