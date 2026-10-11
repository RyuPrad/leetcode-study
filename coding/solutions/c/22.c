static char** res;
static int count, capacity;
static char stack[32];

static void backtrack(int n, int open, int close, int length) {
    if (length == 2 * n) {
        if (count == capacity) { capacity *= 2; res = realloc(res, capacity * sizeof(char*)); }
        res[count] = malloc(length + 1);
        memcpy(res[count], stack, length);
        res[count++][length] = '\0';
        return;
    }
    if (open < n) {
        stack[length] = '(';
        backtrack(n, open + 1, close, length + 1);
    }
    if (close < open) {
        stack[length] = ')';
        backtrack(n, open, close + 1, length + 1);
    }
}

char** generateParenthesis(int n, int* returnSize) {
    count = 0;
    capacity = 16;
    res = malloc(capacity * sizeof(char*));
    backtrack(n, 0, 0, 0);
    *returnSize = count;
    return res;
}
