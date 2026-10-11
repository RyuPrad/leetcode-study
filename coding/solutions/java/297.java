public class Codec {
    // Encodes a tree to a single string.
    public String serialize(TreeNode root) {
        List<String> res = new ArrayList<>();
        write(root, res);
        return String.join(",", res);
    }

    private void write(TreeNode node, List<String> res) {
        if (node == null) { res.add("null"); return; }
        res.add(String.valueOf(node.val));
        write(node.left, res);
        write(node.right, res);
    }

    private String[] vals;
    private int i;

    // Decodes your encoded data to tree.
    public TreeNode deserialize(String data) {
        vals = data.split(",");
        i = 0;
        return read();
    }

    private TreeNode read() {
        if (vals[i].equals("null")) { i++; return null; }
        TreeNode node = new TreeNode(Integer.parseInt(vals[i]));
        i++;
        node.left = read();
        node.right = read();
        return node;
    }
}
