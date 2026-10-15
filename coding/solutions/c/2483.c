int bestClosingTime(char* customers) {
    int penalty = 0, best = 0, bestHour = 0;
    for (int i = 0; customers[i] != '\0'; i++) {
        penalty += customers[i] == 'Y' ? -1 : 1;
        if (penalty < best) {
            best = penalty;
            bestHour = i + 1;
        }
    }
    return bestHour;
}
