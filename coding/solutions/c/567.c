bool checkInclusion(char* s1, char* s2) {
    int n1 = strlen(s1), n2 = strlen(s2);
    if (n1 > n2) return false;
    int need[26] = { 0 }, window[26] = { 0 };
    for (int i = 0; i < n1; i++) need[s1[i] - 'a']++;
    int left = 0;
    for (int right = 0; right < n2; right++) {
        window[s2[right] - 'a']++;
        if (right - left + 1 > n1) {
            window[s2[left] - 'a']--;
            left++;
        }
        if (right - left + 1 == n1 && memcmp(window, need, sizeof need) == 0) {
            return true;
        }
    }
    return false;
}
