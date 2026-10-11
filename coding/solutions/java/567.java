class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] need = new int[26];
        for (char c : s1.toCharArray()) need[c - 'a']++;
        int[] window = new int[26];
        int left = 0;
        for (int right = 0; right < s2.length(); right++) {
            window[s2.charAt(right) - 'a']++;
            if (right - left + 1 > s1.length()) {
                window[s2.charAt(left) - 'a']--;
                left++;
            }
            if (right - left + 1 == s1.length() && Arrays.equals(window, need)) {
                return true;
            }
        }
        return false;
    }
}
