char* simplifyPath(char* path) {
    int n = strlen(path);
    char* copy = malloc(n + 1);
    strcpy(copy, path);
    char** stack = malloc((n + 1) * sizeof(char*));
    int top = 0;
    for (char* part = strtok(copy, "/"); part; part = strtok(NULL, "/")) {
        if (strcmp(part, ".") == 0) {
            continue;
        } else if (strcmp(part, "..") == 0) {
            if (top) top--;
        } else {
            stack[top++] = part;
        }
    }
    char* res = malloc(n + 2);
    int length = 0;
    for (int i = 0; i < top; i++) {
        res[length++] = '/';
        strcpy(res + length, stack[i]);
        length += strlen(stack[i]);
    }
    if (length == 0) res[length++] = '/';
    res[length] = '\0';
    free(stack);
    free(copy);
    return res;
}
