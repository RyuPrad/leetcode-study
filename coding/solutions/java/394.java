class Solution {
    public String decodeString(String s) {
        Deque<StringBuilder> strings = new ArrayDeque<>();
        Deque<Integer> counts = new ArrayDeque<>();
        StringBuilder curStr = new StringBuilder();
        int curNum = 0;
        for (char c : s.toCharArray()) {
            if (c >= '0' && c <= '9') {
                curNum = curNum * 10 + (c - '0');
            } else if (c == '[') {
                strings.push(curStr);
                counts.push(curNum);
                curStr = new StringBuilder();
                curNum = 0;
            } else if (c == ']') {
                StringBuilder prevStr = strings.pop();
                prevStr.append(curStr.toString().repeat(counts.pop()));
                curStr = prevStr;
            } else {
                curStr.append(c);
            }
        }
        return curStr.toString();
    }
}
