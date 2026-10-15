static bool isSubsequence(char* s, char* p, int* removable, int k) {
    int n = strlen(s), m = strlen(p);
    bool* removed = calloc(n, sizeof(bool));
    for (int r = 0; r < k; r++) removed[removable[r]] = true;
    int j = 0;
    for (int i = 0; i < n && j < m; i++) {
        if (!removed[i] && s[i] == p[j]) {
            j++;
        }
    }
    free(removed);
    return j == m;
}

int maximumRemovals(char* s, char* p, int* removable, int removableSize) {
    int left = 0, right = removableSize;
    while (left < right) {
        int mid = (left + right + 1) / 2;
        if (isSubsequence(s, p, removable, mid)) {
            left = mid;
        } else {
            right = mid - 1;
        }
    }
    return left;
}
