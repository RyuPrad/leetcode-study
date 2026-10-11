class Solution {
    public int openLock(String[] deadends, String target) {
        Set<String> dead = new HashSet<>(Arrays.asList(deadends));
        if (dead.contains("0000")) return -1;
        if (target.equals("0000")) return 0;
        Set<String> visited = new HashSet<>(List.of("0000"));
        List<String> queue = new ArrayList<>(List.of("0000"));
        int turns = 0;
        while (!queue.isEmpty()) {
            List<String> next = new ArrayList<>();
            for (String state : queue) {
                if (state.equals(target)) return turns;
                for (int i = 0; i < 4; i++) {
                    for (int d : new int[] { 1, -1 }) {
                        int digit = (state.charAt(i) - '0' + d + 10) % 10;
                        String nextState = state.substring(0, i) + digit + state.substring(i + 1);
                        if (!visited.contains(nextState) && !dead.contains(nextState)) {
                            visited.add(nextState);
                            next.add(nextState);
                        }
                    }
                }
            }
            queue = next;
            turns++;
        }
        return -1;
    }
}
