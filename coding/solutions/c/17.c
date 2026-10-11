static const char* MAP[] = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };
static char** res;
static int count;
static char path[8];

static void dfs(char* digits, int i) {
    if (!digits[i]) {
        path[i] = '\0';
        res[count] = malloc(i + 1);
        strcpy(res[count++], path);
        return;
    }
    for (const char* c = MAP[digits[i] - '0']; *c; c++) {
        path[i] = *c;
        dfs(digits, i + 1);
    }
}

char** letterCombinations(char* digits, int* returnSize) {
    count = 0;
    res = malloc(sizeof(char*) * 256);
    if (digits[0]) dfs(digits, 0);
    *returnSize = count;
    return res;
}
