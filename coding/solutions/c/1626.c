typedef struct {
    int age;
    int score;
} Player;

static int byAgeThenScore(const void* a, const void* b) {
    const Player* x = a;
    const Player* y = b;
    return x->age != y->age ? x->age - y->age : x->score - y->score;
}

int bestTeamScore(int* scores, int scoresSize, int* ages, int agesSize) {
    int n = scoresSize;
    Player* players = malloc(n * sizeof(Player));
    for (int i = 0; i < n; i++) {
        players[i].age = ages[i];
        players[i].score = scores[i];
    }
    qsort(players, n, sizeof(Player), byAgeThenScore);
    int* dp = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        dp[i] = players[i].score;
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (players[j].score <= players[i].score && dp[j] + players[i].score > dp[i]) {
                dp[i] = dp[j] + players[i].score;
            }
        }
    }
    int res = 0;
    for (int i = 0; i < n; i++) {
        if (dp[i] > res) res = dp[i];
    }
    free(players);
    free(dp);
    return res;
}
