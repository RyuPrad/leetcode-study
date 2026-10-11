int candy(int* ratings, int ratingsSize) {
    int n = ratingsSize;
    int* candies = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) candies[i] = 1;
    for (int i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
    }
    for (int i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1] && candies[i + 1] + 1 > candies[i]) candies[i] = candies[i + 1] + 1;
    }
    int total = 0;
    for (int i = 0; i < n; i++) total += candies[i];
    free(candies);
    return total;
}
