public class Codec {
    public String serialize(TreeNode root) {
        StringBuilder out = new StringBuilder();
        write(root, out);
        return out.toString();
    }
    private void write(TreeNode node, StringBuilder out) {
        if (node == null) { out.append("#,"); return; }
        out.append(node.val).append(',');
        write(node.left, out); write(node.right, out);
    }
    public TreeNode deserialize(String data) {
        return read(new ArrayDeque<>(Arrays.asList(data.split(","))));
    }
    private TreeNode read(Deque<String> tokens) {
        String token = tokens.poll();
        if (token.equals("#")) return null;
        TreeNode node = new TreeNode(Integer.parseInt(token));
        node.left = read(tokens); node.right = read(tokens);
        return node;
    }
}
