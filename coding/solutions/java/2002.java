class Solution {
    public int maxProduct(String s) {
        int n = s.length();
        Map<Integer, Integer> palindromes = new LinkedHashMap<>();
        for (int mask = 1; mask < 1 << n; mask++) {
            StringBuilder picked = new StringBuilder();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    picked.append(s.charAt(i));
                }
            }
            if (picked.toString().equals(new StringBuilder(picked).reverse().toString())) {
                palindromes.put(mask, picked.length());
            }
        }
        int res = 0;
        for (Map.Entry<Integer, Integer> a : palindromes.entrySet()) {
            for (Map.Entry<Integer, Integer> b : palindromes.entrySet()) {
                if ((a.getKey() & b.getKey()) == 0) {
                    res = Math.max(res, a.getValue() * b.getValue());
                }
            }
        }
        return res;
    }
}
