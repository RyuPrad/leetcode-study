char* convertToTitle(int columnNumber) {
    char buffer[16];
    int length = 0;
    while (columnNumber > 0) {
        columnNumber--;
        int rem = columnNumber % 26;
        buffer[length++] = (char)('A' + rem);
        columnNumber /= 26;
    }
    char* res = malloc(length + 1);
    for (int i = 0; i < length; i++) res[i] = buffer[length - 1 - i];
    res[length] = '\0';
    return res;
}
