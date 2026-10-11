typedef struct TrieNode {
    struct TrieNode* children[26];
    bool isEnd;
} TrieNode;

static void freeNode(TrieNode* node) {
    if (!node) return;
    for (int i = 0; i < 26; i++) freeNode(node->children[i]);
    free(node);
}

int minExtraChar(char* s, char** dictionary, int dictionarySize) {
    TrieNode* root = calloc(1, sizeof(TrieNode));
    for (int w = 0; w < dictionarySize; w++) {
        TrieNode* node = root;
        for (char* ch = dictionary[w]; *ch; ch++) {
            if (!node->children[*ch - 'a']) node->children[*ch - 'a'] = calloc(1, sizeof(TrieNode));
            node = node->children[*ch - 'a'];
        }
        node->isEnd = true;
    }

    int n = strlen(s);
    int* dp = calloc(n + 1, sizeof(int));
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1; // treat s[i] as an extra char
        TrieNode* node = root;
        for (int j = i; j < n; j++) {
            node = node->children[s[j] - 'a'];
            if (!node) break;
            if (node->isEnd && dp[j + 1] < dp[i]) dp[i] = dp[j + 1];
        }
    }
    int result = dp[0];
    free(dp);
    freeNode(root);
    return result;
}
