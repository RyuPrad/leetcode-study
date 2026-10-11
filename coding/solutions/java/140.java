class Solution {
    private final List<String> res = new ArrayList<>();
    private final List<String> path = new ArrayList<>();

    public List<String> wordBreak(String s, List<String> wordDict) {
        dfs(s, new HashSet<>(wordDict), 0);
        return res;
    }

    private void dfs(String s, Set<String> words, int start) {
        if (start == s.length()) {
            res.add(String.join(" ", path));
            return;
        }
        for (int end = start + 1; end <= s.length(); end++) {
            String word = s.substring(start, end);
            if (words.contains(word)) {
                path.add(word);
                dfs(s, words, end);
                path.remove(path.size() - 1);
            }
        }
    }
}
