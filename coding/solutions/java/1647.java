class Solution {
    public int minDeletions(String s) {
        Map<Character, Integer> count = new HashMap<>();
        for (char c : s.toCharArray()) {
            count.put(c, count.getOrDefault(c, 0) + 1);
        }
        Set<Integer> used = new HashSet<>();
        int res = 0;
        for (int freq : count.values()) {
            while (freq > 0 && used.contains(freq)) {
                freq--;
                res++;
            }
            used.add(freq);
        }
        return res;
    }
}
