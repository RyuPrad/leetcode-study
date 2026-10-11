static bool isAlphaNumeric(char c);

bool isPalindrome(char* s) {
    int left = 0;
    int right = strlen(s) - 1;

    while (left < right) {
        while (left < right && !isAlphaNumeric(s[left])) left++;
        while (left < right && !isAlphaNumeric(s[right])) right--;

        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {
            return false;
        }

        left++;
        right--;
    }

    return true;
}

static bool isAlphaNumeric(char c) {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           (c >= '0' && c <= '9');
}
