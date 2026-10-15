class Solution {
    public String findDifferentBinaryString(String[] nums) {
        Set<String> seen = new HashSet<>(Arrays.asList(nums));
        return build("", nums.length, seen);
    }

    private String build(String current, int n, Set<String> seen) {
        if (current.length() == n) {
            return seen.contains(current) ? null : current;
        }
        String withZero = build(current + "0", n, seen);
        if (withZero != null) {
            return withZero;
        }
        return build(current + "1", n, seen);
    }
}
