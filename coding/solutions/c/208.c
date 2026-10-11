typedef struct TrieNode {
    struct TrieNode* children[26];
    bool isEnd;
} TrieNode;

typedef struct {
    TrieNode* root;
} Trie;

static TrieNode* newNode(void) {
    return calloc(1, sizeof(TrieNode));
}

static TrieNode* find(Trie* obj, char* str) {
    TrieNode* node = obj->root;
    for (; *str; str++) {
        if (!node->children[*str - 'a']) return NULL;
        node = node->children[*str - 'a'];
    }
    return node;
}

Trie* trieCreate() {
    Trie* obj = malloc(sizeof(Trie));
    obj->root = newNode();
    return obj;
}

void trieInsert(Trie* obj, char* word) {
    TrieNode* node = obj->root;
    for (; *word; word++) {
        if (!node->children[*word - 'a']) node->children[*word - 'a'] = newNode();
        node = node->children[*word - 'a'];
    }
    node->isEnd = true;
}

bool trieSearch(Trie* obj, char* word) {
    TrieNode* node = find(obj, word);
    return node && node->isEnd;
}

bool trieStartsWith(Trie* obj, char* prefix) {
    return find(obj, prefix) != NULL;
}

static void freeNode(TrieNode* node) {
    if (!node) return;
    for (int i = 0; i < 26; i++) freeNode(node->children[i]);
    free(node);
}

void trieFree(Trie* obj) {
    freeNode(obj->root);
    free(obj);
}
