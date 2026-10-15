class Solution {
    public int maximumRemovals(String s, String p, int[] removable) {
        int left = 0, right = removable.length;
        while (left < right) {
            int mid = (left + right + 1) / 2;
            if (isSubsequence(s, p, removable, mid)) {
                left = mid;
            } else {
                right = mid - 1;
            }
        }
        return left;
    }

    private boolean isSubsequence(String s, String p, int[] removable, int k) {
        boolean[] removed = new boolean[s.length()];
        for (int r = 0; r < k; r++) removed[removable[r]] = true;
        int j = 0;
        for (int i = 0; i < s.length() && j < p.length(); i++) {
            if (!removed[i] && s.charAt(i) == p.charAt(j)) {
                j++;
            }
        }
        return j == p.length();
    }
}
