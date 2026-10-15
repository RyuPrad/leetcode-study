class Solution {
    public boolean isIsomorphic(String s, String t) {
        Map<Character, Character> mapST = new HashMap<>(), mapTS = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char a = s.charAt(i), b = t.charAt(i);
            if ((mapST.containsKey(a) && mapST.get(a) != b) || (mapTS.containsKey(b) && mapTS.get(b) != a)) {
                return false;
            }
            mapST.put(a, b);
            mapTS.put(b, a);
        }
        return true;
    }
}
