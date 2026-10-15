int maxNumberOfBalloons(char* text) {
    int count[26] = {0};
    for (char* p = text; *p; p++) {
        count[*p - 'a']++;
    }
    const char* letters = "balon";
    int need[5] = {1, 1, 2, 2, 1};
    int res = INT_MAX;
    for (int k = 0; k < 5; k++) {
        int made = count[letters[k] - 'a'] / need[k];
        if (made < res) res = made;
    }
    return res;
}
