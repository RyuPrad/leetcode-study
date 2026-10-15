static char** results;
static int resultCount;
static int ends[4];

static void backtrack(const char* s, int length, int start, int count) {
    if (count == 4) {
        if (start == length) {
            char* ip = malloc(length + 4);
            int k = 0;
            for (int p = 0; p < 4; p++) {
                for (int i = p == 0 ? 0 : ends[p - 1]; i < ends[p]; i++) ip[k++] = s[i];
                if (p < 3) ip[k++] = '.';
            }
            ip[k] = '\0';
            results[resultCount++] = ip;
        }
        return;
    }
    int value = 0;
    for (int len = 1; len <= 3 && start + len <= length; len++) {
        value = value * 10 + (s[start + len - 1] - '0');
        if ((len > 1 && s[start] == '0') || value > 255) {
            break;
        }
        ends[count] = start + len;
        backtrack(s, length, start + len, count + 1);
    }
}

char** restoreIpAddresses(char* s, int* returnSize) {
    results = malloc(81 * sizeof(char*));
    resultCount = 0;
    backtrack(s, strlen(s), 0, 0);
    *returnSize = resultCount;
    return results;
}
