class Solution {
    public int[] successfulPairs(int[] spells, int[] potions, long success) {
        Arrays.sort(potions);
        int[] res = new int[spells.length];
        int count = 0;
        for (int spell : spells) {
            int left = 0, right = potions.length;
            while (left < right) {
                int mid = (left + right) / 2;
                if ((long) spell * potions[mid] >= success) {
                    right = mid;
                } else {
                    left = mid + 1;
                }
            }
            res[count++] = potions.length - left;
        }
        return res;
    }
}
