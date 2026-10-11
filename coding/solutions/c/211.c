typedef struct TrieNode {
    struct TrieNode* children[26];
    bool isEnd;
} TrieNode;

typedef struct {
    TrieNode* root;
} WordDictionary;

WordDictionary* wordDictionaryCreate() {
    WordDictionary* obj = malloc(sizeof(WordDictionary));
    obj->root = calloc(1, sizeof(TrieNode));
    return obj;
}

void wordDictionaryAddWord(WordDictionary* obj, char* word) {
    TrieNode* node = obj->root;
    for (; *word; word++) {
        if (!node->children[*word - 'a']) node->children[*word - 'a'] = calloc(1, sizeof(TrieNode));
        node = node->children[*word - 'a'];
    }
    node->isEnd = true;
}

static bool dfs(TrieNode* node, char* word) {
    if (!*word) return node->isEnd;
    if (*word == '.') {
        for (int i = 0; i < 26; i++) {
            if (node->children[i] && dfs(node->children[i], word + 1)) return true;
        }
        return false;
    }
    if (!node->children[*word - 'a']) return false;
    return dfs(node->children[*word - 'a'], word + 1);
}

bool wordDictionarySearch(WordDictionary* obj, char* word) {
    return dfs(obj->root, word);
}

static void freeNode(TrieNode* node) {
    if (!node) return;
    for (int i = 0; i < 26; i++) freeNode(node->children[i]);
    free(node);
}

void wordDictionaryFree(WordDictionary* obj) {
    freeNode(obj->root);
    free(obj);
}
