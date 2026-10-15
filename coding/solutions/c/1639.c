int numWays(char** words, int wordsSize, char* target) {
    const long long MOD = 1000000007;
    int len = strlen(words[0]), m = strlen(target);
    int (*count)[26] = calloc(len, sizeof(*count));
    for (int w = 0; w < wordsSize; w++) {
        for (int c = 0; c < len; c++) {
            count[c][words[w][c] - 'a']++;
        }
    }
    long long* dp = calloc(m + 1, sizeof(long long));
    dp[0] = 1;
    for (int c = 0; c < len; c++) {
        for (int t = m < c + 1 ? m : c + 1; t >= 1; t--) {
            int ways = count[c][target[t - 1] - 'a'];
            dp[t] = (dp[t] + dp[t - 1] * ways) % MOD;
        }
    }
    int res = (int) dp[m];
    free(count);
    free(dp);
    return res;
}
