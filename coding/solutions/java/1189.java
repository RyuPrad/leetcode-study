class Solution {
    public int maxNumberOfBalloons(String text) {
        int[] count = new int[26];
        for (char c : text.toCharArray()) {
            count[c - 'a']++;
        }
        Map<Character, Integer> need = Map.of('b', 1, 'a', 1, 'l', 2, 'o', 2, 'n', 1);
        int res = Integer.MAX_VALUE;
        for (char c : need.keySet()) {
            res = Math.min(res, count[c - 'a'] / need.get(c));
        }
        return res;
    }
}
