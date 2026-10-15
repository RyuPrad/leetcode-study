class Solution {
    public int countPalindromicSubsequence(String s) {
        int res = 0;
        for (char letter = 'a'; letter <= 'z'; letter++) {
            int first = s.indexOf(letter), last = s.lastIndexOf(letter);
            if (first != -1 && last - first > 1) {
                res += (int) s.substring(first + 1, last).chars().distinct().count();
            }
        }
        return res;
    }
}
