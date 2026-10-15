int minSwaps(char* s) {
    int extraClose = 0, maxClose = 0;
    for (char* p = s; *p; p++) {
        char c = *p;
        if (c == ']') {
            extraClose++;
        } else {
            extraClose--;
        }
        maxClose = maxClose > extraClose ? maxClose : extraClose;
    }
    return (maxClose + 1) / 2;
}
