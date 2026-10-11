int guessNumber(int n) {
    long lo = 1, hi = n;
    while (lo <= hi) {
        int mid = (int)(lo + (hi - lo) / 2), answer = guess(mid);
        if (answer == 0) return mid;
        if (answer < 0) hi = mid - 1; else lo = mid + 1;
    }
    return -1;
}
