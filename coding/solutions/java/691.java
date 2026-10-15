class Solution {
    private Map<String, Integer> memo;
    private String[] stickers;

    public int minStickers(String[] stickers, String target) {
        this.stickers = stickers;
        memo = new HashMap<>();
        memo.put("", 0);
        char[] letters = target.toCharArray();
        Arrays.sort(letters);
        int res = solve(new String(letters));
        return res == Integer.MAX_VALUE ? -1 : res;
    }

    private int solve(String rest) {
        if (memo.containsKey(rest)) {
            return memo.get(rest);
        }
        int best = Integer.MAX_VALUE;
        for (String sticker : stickers) {
            if (sticker.indexOf(rest.charAt(0)) < 0) {
                continue;
            }
            String next = rest;
            for (char ch : sticker.toCharArray()) {
                next = next.replaceFirst(String.valueOf(ch), "");
            }
            int sub = solve(next);
            if (sub != Integer.MAX_VALUE) {
                best = Math.min(best, 1 + sub);
            }
        }
        memo.put(rest, best);
        return best;
    }
}
