class Solution {
    private final int[] sides = new int[4];
    private int side;
    private Integer[] sticks;

    public boolean makesquare(int[] matchsticks) {
        int total = Arrays.stream(matchsticks).sum();
        if (total % 4 != 0) return false;
        side = total / 4;
        sticks = Arrays.stream(matchsticks).boxed().sorted(Collections.reverseOrder()).toArray(Integer[]::new);
        return dfs(0);
    }

    private boolean dfs(int i) {
        if (i == sticks.length) return sides[0] == side && sides[1] == side && sides[2] == side && sides[3] == side;
        for (int j = 0; j < 4; j++) {
            if (sides[j] + sticks[i] <= side) {
                sides[j] += sticks[i];
                if (dfs(i + 1)) return true;
                sides[j] -= sticks[i];
            }
            if (sides[j] == 0) break;
        }
        return false;
    }
}
