class Solution {
    public int maxVowels(String s, int k) {
        Set<Character> vowels = Set.of('a', 'e', 'i', 'o', 'u');
        int count = 0, res = 0;
        for (int right = 0; right < s.length(); right++) {
            if (vowels.contains(s.charAt(right))) {
                count++;
            }
            if (right >= k && vowels.contains(s.charAt(right - k))) {
                count--;
            }
            res = Math.max(res, count);
        }
        return res;
    }
}
