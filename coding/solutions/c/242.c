bool isAnagram(char* s, char* t) {
    if (strlen(s) != strlen(t)) return false;

    int freq[26] = { 0 };

    for (int i = 0; s[i]; i++) {
        freq[s[i] - 'a']++;
        freq[t[i] - 'a']--;
    }

    for (int i = 0; i < 26; i++) {
        if (freq[i] != 0) return false;
    }

    return true;
}
