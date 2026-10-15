class Solution {
    public List<String> findAllConcatenatedWordsInADict(String[] words) {
        Set<String> dict = new HashSet<>(Arrays.asList(words));
        List<String> res = new ArrayList<>();
        for (String word : words) {
            int n = word.length();
            boolean[] dp = new boolean[n + 1];
            dp[0] = true;
            for (int end = 1; end <= n; end++) {
                for (int start = 0; start < end; start++) {
                    if (start == 0 && end == n) {
                        continue;
                    }
                    if (dp[start] && dict.contains(word.substring(start, end))) {
                        dp[end] = true;
                        break;
                    }
                }
            }
            if (dp[n]) {
                res.add(word);
            }
        }
        return res;
    }
}
