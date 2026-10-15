class Solution {
    public List<String> restoreIpAddresses(String s) {
        List<String> res = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(String s, int start, List<String> parts, List<String> res) {
        if (parts.size() == 4) {
            if (start == s.length()) {
                res.add(String.join(".", parts));
            }
            return;
        }
        for (int len = 1; len <= 3 && start + len <= s.length(); len++) {
            String part = s.substring(start, start + len);
            if ((part.length() > 1 && part.charAt(0) == '0') || Integer.parseInt(part) > 255) {
                break;
            }
            parts.add(part);
            backtrack(s, start + len, parts, res);
            parts.remove(parts.size() - 1);
        }
    }
}
