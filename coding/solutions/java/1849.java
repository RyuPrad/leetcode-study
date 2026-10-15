class Solution {
    public boolean splitString(String s) {
        long first = 0;
        for (int cut = 0; cut < s.length() - 1; cut++) {
            first = first * 10 + (s.charAt(cut) - '0');
            if (first >= 10000000000L) {
                break;
            }
            if (dfs(s, cut + 1, first)) {
                return true;
            }
        }
        return false;
    }

    private boolean dfs(String s, int start, long prev) {
        if (start == s.length()) {
            return true;
        }
        long value = 0;
        for (int end = start; end < s.length(); end++) {
            value = value * 10 + (s.charAt(end) - '0');
            if (value >= prev) {
                break;
            }
            if (value == prev - 1 && dfs(s, end + 1, value)) {
                return true;
            }
        }
        return false;
    }
}
