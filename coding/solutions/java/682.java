class Solution {
    public int calPoints(String[] operations) {
        List<Integer> stack = new ArrayList<>();
        for (String op : operations) {
            int n = stack.size();
            if (op.equals("+")) {
                stack.add(stack.get(n - 1) + stack.get(n - 2));
            } else if (op.equals("D")) {
                stack.add(stack.get(n - 1) * 2);
            } else if (op.equals("C")) {
                stack.remove(n - 1);
            } else {
                stack.add(Integer.parseInt(op));
            }
        }
        int total = 0;
        for (int score : stack) total += score;
        return total;
    }
}
