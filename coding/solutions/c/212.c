typedef struct TrieNode {
    struct TrieNode* children[26];
    char* word;
} TrieNode;

static const int DIRS[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
static char** res;
static int count;

static void dfs(char** board, int rows, int cols, int r, int c, TrieNode* node) {
    char ch = board[r][c];
    TrieNode* child = node->children[ch - 'a'];
    if (!child) return;
    if (child->word) {
        res[count++] = child->word;
        child->word = NULL;
    }
    board[r][c] = '#';
    for (int d = 0; d < 4; d++) {
        int nr = r + DIRS[d][0];
        int nc = c + DIRS[d][1];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] != '#') {
            dfs(board, rows, cols, nr, nc, child);
        }
    }
    board[r][c] = ch;
}

char** findWords(char** board, int boardSize, int* boardColSize, char** words, int wordsSize, int* returnSize) {
    TrieNode* root = calloc(1, sizeof(TrieNode));
    for (int i = 0; i < wordsSize; i++) {
        TrieNode* node = root;
        for (char* ch = words[i]; *ch; ch++) {
            if (!node->children[*ch - 'a']) node->children[*ch - 'a'] = calloc(1, sizeof(TrieNode));
            node = node->children[*ch - 'a'];
        }
        node->word = words[i];
    }
    res = malloc((wordsSize ? wordsSize : 1) * sizeof(char*));
    count = 0;
    for (int r = 0; r < boardSize; r++) {
        for (int c = 0; c < boardColSize[0]; c++) {
            dfs(board, boardSize, boardColSize[0], r, c, root);
        }
    }
    *returnSize = count;
    return res;
}
