bool canReach(char* s, int minJump, int maxJump) {
    int n = strlen(s);
    bool* dp = calloc(n, sizeof(bool));
    dp[0] = true;
    int windowCount = 0;
    for (int i = 1; i < n; i++) {
        if (i >= minJump) windowCount += dp[i - minJump] ? 1 : 0;
        if (i > maxJump) windowCount -= dp[i - maxJump - 1] ? 1 : 0;
        dp[i] = windowCount > 0 && s[i] == '0';
    }
    bool result = dp[n - 1];
    free(dp);
    return result;
}
