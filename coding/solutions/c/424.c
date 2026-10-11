int characterReplacement(char* s, int k) {
    int freq[26] = { 0 };
    int left = 0;
    int maxFreq = 0;
    int ans = 0;
    for (int right = 0; s[right]; right++) {
        int count = ++freq[s[right] - 'A'];
        if (count > maxFreq) maxFreq = count;
        while ((right - left + 1) - maxFreq > k) {
            freq[s[left] - 'A']--;
            left++;
        }
        if (right - left + 1 > ans) ans = right - left + 1;
    }
    return ans;
}
