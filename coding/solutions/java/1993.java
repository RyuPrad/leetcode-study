class LockingTree {
    private final int[] parent;
    private final int[] locked;
    private final List<List<Integer>> children = new ArrayList<>();

    public LockingTree(int[] parent) {
        this.parent = parent;
        locked = new int[parent.length];
        for (int i = 0; i < parent.length; i++) {
            children.add(new ArrayList<>());
        }
        for (int i = 1; i < parent.length; i++) {
            children.get(parent[i]).add(i);
        }
    }

    public boolean lock(int num, int user) {
        if (locked[num] != 0) {
            return false;
        }
        locked[num] = user;
        return true;
    }

    public boolean unlock(int num, int user) {
        if (locked[num] != user) {
            return false;
        }
        locked[num] = 0;
        return true;
    }

    public boolean upgrade(int num, int user) {
        for (int node = num; node != -1; node = parent[node]) {
            if (locked[node] != 0) {
                return false;
            }
        }
        boolean found = false;
        Deque<Integer> stack = new ArrayDeque<>(children.get(num));
        while (!stack.isEmpty()) {
            int node = stack.pop();
            if (locked[node] != 0) {
                locked[node] = 0;
                found = true;
            }
            for (int child : children.get(node)) stack.push(child);
        }
        if (found) {
            locked[num] = user;
        }
        return found;
    }
}
