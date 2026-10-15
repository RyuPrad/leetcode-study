class Solution {
    public List<String> findRepeatedDnaSequences(String s) {
        Set<String> seen = new HashSet<>(), repeated = new LinkedHashSet<>();
        for (int i = 0; i + 10 <= s.length(); i++) {
            String sequence = s.substring(i, i + 10);
            if (seen.contains(sequence)) {
                repeated.add(sequence);
            } else {
                seen.add(sequence);
            }
        }
        return new ArrayList<>(repeated);
    }
}
