class Solution {
    public List<String> fullJustify(String[] words, int maxWidth) {
        List<String> res = new ArrayList<>();
        int i = 0;
        while (i < words.length) {
            int j = i, length = 0;
            while (j < words.length && length + words[j].length() + (j - i) <= maxWidth) {
                length += words[j].length();
                j++;
            }
            int gaps = j - i - 1;
            StringBuilder line = new StringBuilder();
            if (j == words.length || gaps == 0) {
                line.append(String.join(" ", Arrays.copyOfRange(words, i, j)));
                line.append(" ".repeat(maxWidth - line.length()));
            } else {
                int spaces = (maxWidth - length) / gaps, extra = (maxWidth - length) % gaps;
                for (int k = i; k < j - 1; k++) {
                    line.append(words[k]).append(" ".repeat(spaces + (k - i < extra ? 1 : 0)));
                }
                line.append(words[j - 1]);
            }
            res.add(line.toString());
            i = j;
        }
        return res;
    }
}
