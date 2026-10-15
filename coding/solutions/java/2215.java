class Solution {
    public List<List<Integer>> findDifference(int[] nums1, int[] nums2) {
        Set<Integer> set1 = new LinkedHashSet<>(), set2 = new LinkedHashSet<>();
        for (int num : nums1) set1.add(num);
        for (int num : nums2) set2.add(num);
        List<Integer> only1 = set1.stream().filter(num -> !set2.contains(num)).toList();
        List<Integer> only2 = set2.stream().filter(num -> !set1.contains(num)).toList();
        return List.of(only1, only2);
    }
}
