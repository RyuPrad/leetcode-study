class Solution {
    public String reorganizeString(String s) {
        int[] freq = new int[26];
        for (char c : s.toCharArray()) freq[c - 'a']++;
        // Larger count first; ties go to the larger character.
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] != b[0] ? b[0] - a[0] : b[1] - a[1]);
        for (int c = 0; c < 26; c++) if (freq[c] > 0) heap.add(new int[] { freq[c], c });
        StringBuilder res = new StringBuilder();
        int[] prev = null;
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            res.append((char) ('a' + top[1]));
            if (prev != null && prev[0] > 0) heap.add(prev);
            prev = new int[] { top[0] - 1, top[1] };
        }
        return res.length() == s.length() ? res.toString() : "";
    }
}
