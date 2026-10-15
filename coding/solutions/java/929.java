class Solution {
    public int numUniqueEmails(String[] emails) {
        Set<String> unique = new HashSet<>();
        for (String email : emails) {
            String[] parts = email.split("@");
            String local = parts[0], domain = parts[1];
            String name = local.split("\\+")[0].replace(".", "");
            unique.add(name + "@" + domain);
        }
        return unique.size();
    }
}
