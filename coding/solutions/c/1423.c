int maxScore(int* cardPoints, int cardPointsSize, int k) {
    int n = cardPointsSize;
    int total = 0;
    for (int i = 0; i < k; i++) {
        total += cardPoints[i];
    }
    int res = total;
    for (int i = 0; i < k; i++) {
        total += cardPoints[n - 1 - i] - cardPoints[k - 1 - i];
        if (total > res) res = total;
    }
    return res;
}
