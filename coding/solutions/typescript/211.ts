class TrieNode {
  children: Record<string, TrieNode> = {};
  isEnd = false;
}

class WordDictionary {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  addWord(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const dfs = (node: TrieNode, i: number): boolean => {
      if (i === word.length) return node.isEnd;
      const ch = word[i];
      if (ch === ".") {
        for (const key in node.children) {
          if (dfs(node.children[key], i + 1)) return true;
        }
        return false;
      }
      if (!node.children[ch]) return false;
      return dfs(node.children[ch], i + 1);
    };
    return dfs(this.root, 0);
  }
}
