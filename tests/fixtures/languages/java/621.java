class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] counts = new int[26];
        for (char t : tasks) counts[t - 'A']++;
        int most = Arrays.stream(counts).max().getAsInt(), ties = (int) Arrays.stream(counts).filter(c -> c == most).count();
        return Math.max(tasks.length, (most - 1) * (n + 1) + ties);
    }
}
