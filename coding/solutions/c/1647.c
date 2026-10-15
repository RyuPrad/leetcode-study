int minDeletions(char* s) {
    int count[26] = {0};
    int length = strlen(s);
    for (int i = 0; i < length; i++) {
        count[s[i] - 'a']++;
    }
    bool* used = calloc(length + 1, sizeof(bool));
    int res = 0;
    for (int letter = 0; letter < 26; letter++) {
        int freq = count[letter];
        while (freq > 0 && used[freq]) {
            freq--;
            res++;
        }
        used[freq] = true;
    }
    free(used);
    return res;
}
