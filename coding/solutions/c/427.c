static struct Node* newNode(bool val, bool isLeaf) {
    struct Node* node = calloc(1, sizeof(struct Node));
    node->val = val;
    node->isLeaf = isLeaf;
    return node;
}

static struct Node* build(int** grid, int r, int c, int n) {
    bool same = true;
    for (int i = r; i < r + n; i++) {
        for (int j = c; j < c + n; j++) {
            if (grid[i][j] != grid[r][c]) same = false;
        }
    }
    if (same) return newNode(grid[r][c] == 1, true);
    int half = n / 2;
    struct Node* node = newNode(true, false);
    node->topLeft = build(grid, r, c, half);
    node->topRight = build(grid, r, c + half, half);
    node->bottomLeft = build(grid, r + half, c, half);
    node->bottomRight = build(grid, r + half, c + half, half);
    return node;
}

struct Node* construct(int** grid, int gridSize, int* gridColSize) {
    return build(grid, 0, 0, gridSize);
}
