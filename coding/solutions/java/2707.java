class Solution {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd;
    }

    public int minExtraChar(String s, String[] dictionary) {
        TrieNode root = new TrieNode();
        for (String word : dictionary) {
            TrieNode node = root;
            for (char ch : word.toCharArray()) {
                if (node.children[ch - 'a'] == null) node.children[ch - 'a'] = new TrieNode();
                node = node.children[ch - 'a'];
            }
            node.isEnd = true;
        }

        int n = s.length();
        int[] dp = new int[n + 1];
        for (int i = n - 1; i >= 0; i--) {
            dp[i] = dp[i + 1] + 1; // treat s[i] as an extra char
            TrieNode node = root;
            for (int j = i; j < n; j++) {
                node = node.children[s.charAt(j) - 'a'];
                if (node == null) break;
                if (node.isEnd) dp[i] = Math.min(dp[i], dp[j + 1]);
            }
        }
        return dp[0];
    }
}
