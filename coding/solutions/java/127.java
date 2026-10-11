class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> words = new HashSet<>(wordList);
        if (!words.contains(endWord)) return 0;
        List<String> queue = new ArrayList<>(List.of(beginWord));
        Set<String> visited = new HashSet<>(List.of(beginWord));
        int level = 1;
        while (!queue.isEmpty()) {
            List<String> next = new ArrayList<>();
            for (String word : queue) {
                if (word.equals(endWord)) return level;
                char[] letters = word.toCharArray();
                for (int i = 0; i < letters.length; i++) {
                    char original = letters[i];
                    for (char ch = 'a'; ch <= 'z'; ch++) {
                        letters[i] = ch;
                        String cand = new String(letters);
                        if (words.contains(cand) && visited.add(cand)) {
                            next.add(cand);
                        }
                    }
                    letters[i] = original;
                }
            }
            queue = next;
            level++;
        }
        return 0;
    }
}
