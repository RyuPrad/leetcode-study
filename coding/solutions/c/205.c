bool isIsomorphic(char* s, char* t) {
    int mapST[256] = {0}, mapTS[256] = {0};
    for (int i = 0; s[i] != '\0'; i++) {
        unsigned char a = s[i], b = t[i];
        if ((mapST[a] && mapST[a] != b) || (mapTS[b] && mapTS[b] != a)) {
            return false;
        }
        mapST[a] = b;
        mapTS[b] = a;
    }
    return true;
}
