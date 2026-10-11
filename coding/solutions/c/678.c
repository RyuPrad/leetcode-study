bool checkValidString(char* s) {
    int low = 0, high = 0;
    for (; *s; s++) {
        if (*s == '(') { low++; high++; }
        else if (*s == ')') { low--; high--; }
        else { low--; high++; }
        if (high < 0) return false;
        if (low < 0) low = 0;
    }
    return low == 0;
}
