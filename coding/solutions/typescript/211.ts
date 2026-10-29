class TrieNode {
  children = new Map<string, TrieNode>();
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
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const dfs = (node: TrieNode, i: number): boolean => {
      if (i === word.length) return node.isEnd;
      const ch = word[i];
      if (ch === ".") {
        for (const key of node.children.keys()) {
          if (dfs(node.children.get(key)!, i + 1)) return true;
        }
        return false;
      }
      if (!node.children.has(ch)) return false;
      return dfs(node.children.get(ch)!, i + 1);
    };
    return dfs(this.root, 0);
  }
}
