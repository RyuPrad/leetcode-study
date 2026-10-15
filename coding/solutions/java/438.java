class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> res = new ArrayList<>();
        if (p.length() > s.length()) {
            return res;
        }
        int[] need = new int[26], have = new int[26];
        for (int i = 0; i < p.length(); i++) {
            need[p.charAt(i) - 'a']++;
            have[s.charAt(i) - 'a']++;
        }
        if (Arrays.equals(need, have)) {
            res.add(0);
        }
        for (int right = p.length(); right < s.length(); right++) {
            have[s.charAt(right) - 'a']++;
            have[s.charAt(right - p.length()) - 'a']--;
            if (Arrays.equals(need, have)) {
                res.add(right - p.length() + 1);
            }
        }
        return res;
    }
}
