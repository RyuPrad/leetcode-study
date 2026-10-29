class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
}

function minExtraChar(s: string, dictionary: string[]): number {
  const root = new TrieNode();
  for (const word of dictionary) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  const n = s.length;
  const dp: number[] = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    dp[i] = dp[i + 1] + 1; // treat s[i] as an extra char
    let node = root;
    for (let j = i; j < n; j++) {
      const ch = s[j];
      if (!node.children.has(ch)) break;
      node = node.children.get(ch)!;
      if (node.isEnd) dp[i] = Math.min(dp[i], dp[j + 1]);
    }
  }
  return dp[0];
}
