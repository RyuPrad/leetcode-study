class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new LinkedHashMap<>();

        for (int num : nums) {
            freq.merge(num, 1, Integer::sum);
        }

        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) buckets.add(new ArrayList<>());

        for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
            buckets.get(entry.getValue()).add(entry.getKey());
        }

        int[] res = new int[k];
        int size = 0;

        for (int count = buckets.size() - 1; count >= 0; count--) {
            for (int num : buckets.get(count)) {
                res[size++] = num;
                if (size == k) return res;
            }
        }

        return res;
    }
}
