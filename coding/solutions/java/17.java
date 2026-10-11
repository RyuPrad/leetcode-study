class Solution {
    private static final String[] MAP = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };
    private final List<String> res = new ArrayList<>();
    private final StringBuilder path = new StringBuilder();

    public List<String> letterCombinations(String digits) {
        if (digits.isEmpty()) return res;
        dfs(digits, 0);
        return res;
    }

    private void dfs(String digits, int i) {
        if (i == digits.length()) {
            res.add(path.toString());
            return;
        }
        for (char c : MAP[digits.charAt(i) - '0'].toCharArray()) {
            path.append(c);
            dfs(digits, i + 1);
            path.deleteCharAt(path.length() - 1);
        }
    }
}
