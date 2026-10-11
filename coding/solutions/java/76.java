class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        int needCount = 0;
        for (char c : t.toCharArray()) if (need[c]++ == 0) needCount++;
        int[] window = new int[128];
        int have = 0, left = 0;
        int resLen = Integer.MAX_VALUE, resStart = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            window[c]++;
            if (need[c] > 0 && window[c] == need[c]) have++;
            while (have == needCount) {
                if (right - left + 1 < resLen) {
                    resLen = right - left + 1; resStart = left;
                }
                char d = s.charAt(left);
                window[d]--;
                if (need[d] > 0 && window[d] < need[d]) have--;
                left++;
            }
        }
        return resLen == Integer.MAX_VALUE ? "" : s.substring(resStart, resStart + resLen);
    }
}
