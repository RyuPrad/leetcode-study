public class Codec {
    // Encodes a list of strings to a single string.
    public String encode(List<String> strs) {
        StringBuilder out = new StringBuilder();
        for (String s : strs) out.append(s.length()).append('#').append(s);
        return out.toString();
    }
    // Decodes a single string to a list of strings.
    public List<String> decode(String s) {
        List<String> out = new ArrayList<>();
        for (int i = 0; i < s.length();) {
            int hash = s.indexOf('#', i), length = Integer.parseInt(s.substring(i, hash));
            out.add(s.substring(hash + 1, hash + 1 + length));
            i = hash + 1 + length;
        }
        return out;
    }
}
