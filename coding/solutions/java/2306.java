class Solution {
    public long distinctNames(String[] ideas) {
        Map<Character, Set<String>> groups = new LinkedHashMap<>();
        for (String idea : ideas) {
            char first = idea.charAt(0);
            String suffix = idea.substring(1);
            if (!groups.containsKey(first)) {
                groups.put(first, new HashSet<>());
            }
            groups.get(first).add(suffix);
        }
        List<Character> letters = new ArrayList<>(groups.keySet());
        long res = 0;
        for (int a = 0; a < letters.size(); a++) {
            for (int b = a + 1; b < letters.size(); b++) {
                Set<String> setA = groups.get(letters.get(a)), setB = groups.get(letters.get(b));
                long shared = 0;
                for (String suffix : setA) {
                    if (setB.contains(suffix)) {
                        shared++;
                    }
                }
                res += 2 * (setA.size() - shared) * (setB.size() - shared);
            }
        }
        return res;
    }
}
