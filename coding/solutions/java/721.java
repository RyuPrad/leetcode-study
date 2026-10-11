class Solution {
    private int[] parent;

    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        parent = new int[accounts.size()];
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        Map<String, Integer> emailToId = new LinkedHashMap<>();
        for (int i = 0; i < accounts.size(); i++) {
            for (int j = 1; j < accounts.get(i).size(); j++) {
                String email = accounts.get(i).get(j);
                if (emailToId.containsKey(email)) union(i, emailToId.get(email));
                else emailToId.put(email, i);
            }
        }
        Map<Integer, List<String>> groups = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> entry : emailToId.entrySet()) {
            groups.computeIfAbsent(find(entry.getValue()), k -> new ArrayList<>()).add(entry.getKey());
        }
        List<List<String>> res = new ArrayList<>();
        for (Map.Entry<Integer, List<String>> group : groups.entrySet()) {
            List<String> emails = group.getValue();
            Collections.sort(emails);
            List<String> account = new ArrayList<>();
            account.add(accounts.get(group.getKey()).get(0));
            account.addAll(emails);
            res.add(account);
        }
        return res;
    }

    private int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    private void union(int a, int b) {
        parent[find(a)] = find(b);
    }
}
