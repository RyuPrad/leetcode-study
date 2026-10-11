class Solution {
    public String alienOrder(String[] words) {
        // Insertion-ordered maps keep the result order of the reference.
        Map<Character, Set<Character>> adj = new LinkedHashMap<>();
        Map<Character, Integer> indegree = new LinkedHashMap<>();
        for (String w : words) {
            for (char ch : w.toCharArray()) {
                adj.putIfAbsent(ch, new LinkedHashSet<>());
                indegree.putIfAbsent(ch, 0);
            }
        }
        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i], w2 = words[i + 1];
            int minLen = Math.min(w1.length(), w2.length());
            if (w1.length() > w2.length() && w1.startsWith(w2)) return "";
            for (int j = 0; j < minLen; j++) {
                char a = w1.charAt(j), b = w2.charAt(j);
                if (a != b) {
                    if (adj.get(a).add(b)) indegree.put(b, indegree.get(b) + 1);
                    break;
                }
            }
        }
        List<Character> queue = new ArrayList<>();
        for (Map.Entry<Character, Integer> entry : indegree.entrySet()) if (entry.getValue() == 0) queue.add(entry.getKey());
        StringBuilder res = new StringBuilder();
        for (int head = 0; head < queue.size(); head++) {
            char ch = queue.get(head);
            res.append(ch);
            for (char nei : adj.get(ch)) {
                indegree.put(nei, indegree.get(nei) - 1);
                if (indegree.get(nei) == 0) queue.add(nei);
            }
        }
        return res.length() == indegree.size() ? res.toString() : "";
    }
}
