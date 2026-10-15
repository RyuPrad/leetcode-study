class Solution {
    public int minFlips(String s) {
        int n = s.length();
        String t = s + s;
        int diff1 = 0, diff2 = 0, res = Integer.MAX_VALUE;
        for (int right = 0; right < t.length(); right++) {
            if (t.charAt(right) != (right % 2 == 0 ? '0' : '1')) diff1++;
            if (t.charAt(right) != (right % 2 == 0 ? '1' : '0')) diff2++;
            if (right >= n) {
                int left = right - n;
                if (t.charAt(left) != (left % 2 == 0 ? '0' : '1')) diff1--;
                if (t.charAt(left) != (left % 2 == 0 ? '1' : '0')) diff2--;
            }
            if (right >= n - 1) {
                res = Math.min(res, Math.min(diff1, diff2));
            }
        }
        return res;
    }
}
