long long mostPoints(int** questions, int questionsSize, int* questionsColSize) {
    int n = questionsSize;
    long long* dp = calloc(n + 1, sizeof(long long));
    for (int i = n - 1; i >= 0; i--) {
        int points = questions[i][0], skip = questions[i][1];
        int next = i + skip + 1 < n ? i + skip + 1 : n;
        long long solve = points + dp[next];
        dp[i] = solve > dp[i + 1] ? solve : dp[i + 1];
    }
    long long res = dp[0];
    free(dp);
    return res;
}
