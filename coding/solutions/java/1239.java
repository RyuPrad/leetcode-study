class Solution {
    private int res;

    public int maxLength(List<String> arr) {
        res = 0;
        backtrack(arr, 0, "");
        return res;
    }

    private void backtrack(List<String> arr, int index, String used) {
        res = Math.max(res, used.length());
        for (int i = index; i < arr.size(); i++) {
            String candidate = used + arr.get(i);
            if (unique(candidate)) {
                backtrack(arr, i + 1, candidate);
            }
        }
    }

    private boolean unique(String text) {
        boolean[] seen = new boolean[26];
        for (char ch : text.toCharArray()) {
            if (seen[ch - 'a']) return false;
            seen[ch - 'a'] = true;
        }
        return true;
    }
}
