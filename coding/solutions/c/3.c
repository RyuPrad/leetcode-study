int lengthOfLongestSubstring(char* s) {
    bool seen[256] = { false };
    int left = 0;
    int ans = 0;
    for (int right = 0; s[right]; right++) {
        while (seen[(unsigned char)s[right]]) {
            seen[(unsigned char)s[left]] = false;
            left++;
        }
        seen[(unsigned char)s[right]] = true;
        if (right - left + 1 > ans) ans = right - left + 1;
    }
    return ans;
}
