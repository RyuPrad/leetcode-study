class Solution {
    public String removeKdigits(String num, int k) {
        StringBuilder stack = new StringBuilder();
        for (char digit : num.toCharArray()) {
            while (k > 0 && stack.length() > 0 && stack.charAt(stack.length() - 1) > digit) {
                stack.deleteCharAt(stack.length() - 1);
                k--;
            }
            stack.append(digit);
        }
        while (k > 0) {
            stack.deleteCharAt(stack.length() - 1);
            k--;
        }
        String res = stack.toString().replaceFirst("^0+", "");
        return res.isEmpty() ? "0" : res;
    }
}
