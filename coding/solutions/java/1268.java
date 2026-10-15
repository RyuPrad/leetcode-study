class Solution {
    public List<List<String>> suggestedProducts(String[] products, String searchWord) {
        Arrays.sort(products);
        List<List<String>> res = new ArrayList<>();
        String prefix = "";
        for (char c : searchWord.toCharArray()) {
            prefix += c;
            int left = 0, right = products.length;
            while (left < right) {
                int mid = (left + right) / 2;
                if (products[mid].compareTo(prefix) < 0) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }
            List<String> matches = new ArrayList<>();
            for (int i = left; i < Math.min(left + 3, products.length); i++) {
                if (products[i].startsWith(prefix)) {
                    matches.add(products[i]);
                }
            }
            res.add(matches);
        }
        return res;
    }
}
