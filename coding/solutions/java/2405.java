class Solution {
    public int partitionString(String s) {
        Set<Character> seen = new HashSet<>();
        int res = 1;
        for (char c : s.toCharArray()) {
            if (seen.contains(c)) {
                res++;
                seen = new HashSet<>();
            }
            seen.add(c);
        }
        return res;
    }
}
