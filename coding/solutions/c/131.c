static char*** res;
static int* cols;
static int count, capacity;
static char* path[16];

static bool isPal(char* s, int l, int r) {
    while (l < r) {
        if (s[l] != s[r]) return false;
        l++; r--;
    }
    return true;
}

static void dfs(char* s, int n, int start, int length) {
    if (start == n) {
        if (count == capacity) {
            capacity *= 2;
            res = realloc(res, capacity * sizeof(char**));
            cols = realloc(cols, capacity * sizeof(int));
        }
        res[count] = malloc(length * sizeof(char*));
        for (int i = 0; i < length; i++) {
            res[count][i] = malloc(strlen(path[i]) + 1);
            strcpy(res[count][i], path[i]);
        }
        cols[count++] = length;
        return;
    }
    for (int end = start; end < n; end++) {
        if (isPal(s, start, end)) {
            char* piece = malloc(end - start + 2);
            memcpy(piece, s + start, end - start + 1);
            piece[end - start + 1] = '\0';
            path[length] = piece;
            dfs(s, n, end + 1, length + 1);
            free(piece);
        }
    }
}

char*** partition(char* s, int* returnSize, int** returnColumnSizes) {
    count = 0;
    capacity = 16;
    res = malloc(capacity * sizeof(char**));
    cols = malloc(capacity * sizeof(int));
    dfs(s, strlen(s), 0, 0);
    *returnSize = count;
    *returnColumnSizes = cols;
    return res;
}
