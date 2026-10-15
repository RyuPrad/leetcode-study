class Solution {
    public String largestNumber(int[] nums) {
        String[] strs = Arrays.stream(nums).mapToObj(String::valueOf).toArray(String[]::new);
        Arrays.sort(strs, (a, b) -> (b + a).compareTo(a + b));
        String res = String.join("", strs);
        return res.charAt(0) == '0' ? "0" : res;
    }
}
