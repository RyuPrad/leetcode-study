int minFlipsMonoIncr(char* s) {
    int ones = 0, res = 0;
    for (int i = 0; s[i]; i++) {
        if (s[i] == '1') {
            ones++;
        } else {
            res = res + 1 < ones ? res + 1 : ones;
        }
    }
    return res;
}
