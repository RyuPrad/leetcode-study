class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        int[][] cars = new int[n][]; for (int i = 0; i < n; i++) cars[i] = new int[] { position[i], speed[i] };
        Arrays.sort(cars, (a, b) -> Integer.compare(b[0], a[0]));
        List<Double> stack = new ArrayList<>();
        for (int[] car : cars) {
            double time = (double) (target - car[0]) / car[1];
            stack.add(time);
            if (stack.size() >= 2 && stack.get(stack.size() - 1) <= stack.get(stack.size() - 2)) {
                stack.remove(stack.size() - 1);
            }
        }
        return stack.size();
    }
}
