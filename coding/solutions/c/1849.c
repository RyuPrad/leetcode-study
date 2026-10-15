static bool dfs(const char* s, int length, int start, long long prev) {
    if (start == length) {
        return true;
    }
    long long value = 0;
    for (int end = start; end < length; end++) {
        value = value * 10 + (s[end] - '0');
        if (value >= prev) {
            break;
        }
        if (value == prev - 1 && dfs(s, length, end + 1, value)) {
            return true;
        }
    }
    return false;
}

bool splitString(char* s) {
    int length = strlen(s);
    long long first = 0;
    for (int cut = 0; cut < length - 1; cut++) {
        first = first * 10 + (s[cut] - '0');
        if (first >= 10000000000LL) {
            break;
        }
        if (dfs(s, length, cut + 1, first)) {
            return true;
        }
    }
    return false;
}
