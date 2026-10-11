static int sides[4];
static int side;

static int descending(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (y > x) - (y < x);
}

static bool dfs(int* sticks, int count, int i) {
    if (i == count) return sides[0] == side && sides[1] == side && sides[2] == side && sides[3] == side;
    for (int j = 0; j < 4; j++) {
        if (sides[j] + sticks[i] <= side) {
            sides[j] += sticks[i];
            if (dfs(sticks, count, i + 1)) return true;
            sides[j] -= sticks[i];
        }
        if (sides[j] == 0) break;
    }
    return false;
}

bool makesquare(int* matchsticks, int matchsticksSize) {
    int total = 0;
    for (int i = 0; i < matchsticksSize; i++) total += matchsticks[i];
    if (total % 4 != 0) return false;
    side = total / 4;
    memset(sides, 0, sizeof sides);
    qsort(matchsticks, matchsticksSize, sizeof(int), descending);
    return dfs(matchsticks, matchsticksSize, 0);
}
