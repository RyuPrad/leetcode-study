int mincostTickets(int* days, int daysSize, int* costs, int costsSize) {
    int last = days[daysSize - 1];
    bool* travel = calloc(last + 1, sizeof(bool));
    for (int i = 0; i < daysSize; i++) {
        travel[days[i]] = true;
    }
    int* dp = calloc(last + 1, sizeof(int));
    for (int d = 1; d <= last; d++) {
        if (!travel[d]) {
            dp[d] = dp[d - 1];
            continue;
        }
        int day = dp[d - 1] + costs[0];
        int week = dp[d - 7 > 0 ? d - 7 : 0] + costs[1];
        int month = dp[d - 30 > 0 ? d - 30 : 0] + costs[2];
        int best = day < week ? day : week;
        dp[d] = best < month ? best : month;
    }
    int res = dp[last];
    free(travel);
    free(dp);
    return res;
}
