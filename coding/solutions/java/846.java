class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) return false;
        TreeMap<Integer, Integer> count = new TreeMap<>();
        for (int card : hand) count.merge(card, 1, Integer::sum);
        for (int start : new ArrayList<>(count.keySet())) {
            int need = count.get(start);
            if (need > 0) {
                for (int card = start; card < start + groupSize; card++) {
                    if (count.getOrDefault(card, 0) < need) return false;
                    count.put(card, count.get(card) - need);
                }
            }
        }
        return true;
    }
}
