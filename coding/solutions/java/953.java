class Solution {
    public boolean isAlienSorted(String[] words, String order) {
        int[] rank = new int[26];
        for (int i = 0; i < order.length(); i++) rank[order.charAt(i) - 'a'] = i;
        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i];
            String w2 = words[i + 1];
            int j = 0;
            while (true) {
                if (j == w1.length()) break;
                if (j == w2.length()) return false;
                if (w1.charAt(j) != w2.charAt(j)) {
                    if (rank[w1.charAt(j) - 'a'] > rank[w2.charAt(j) - 'a']) return false;
                    break;
                }
                j++;
            }
        }
        return true;
    }
}
