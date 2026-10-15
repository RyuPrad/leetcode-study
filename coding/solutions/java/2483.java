class Solution {
    public int bestClosingTime(String customers) {
        int penalty = 0, best = 0, bestHour = 0;
        for (int i = 0; i < customers.length(); i++) {
            penalty += customers.charAt(i) == 'Y' ? -1 : 1;
            if (penalty < best) {
                best = penalty;
                bestHour = i + 1;
            }
        }
        return bestHour;
    }
}
