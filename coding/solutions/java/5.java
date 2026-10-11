class Solution {
    private int start, maxLen;

    public String longestPalindrome(String s) {
        if (s.length() < 2) return s;
        start = 0;
        maxLen = 1;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);
            expand(s, i, i + 1);
        }
        return s.substring(start, start + maxLen);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            if (r - l + 1 > maxLen) { start = l; maxLen = r - l + 1; }
            l--;
            r++;
        }
    }
}
