static bool isVowel(char c) {
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int maxVowels(char* s, int k) {
    int count = 0, res = 0;
    for (int right = 0; s[right] != '\0'; right++) {
        if (isVowel(s[right])) {
            count++;
        }
        if (right >= k && isVowel(s[right - k])) {
            count--;
        }
        res = res > count ? res : count;
    }
    return res;
}
