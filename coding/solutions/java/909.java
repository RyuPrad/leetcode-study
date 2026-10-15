class Solution {
    public int snakesAndLadders(int[][] board) {
        int n = board.length;
        int[] moves = new int[n * n + 1];
        Arrays.fill(moves, -1);
        moves[1] = 0;
        List<Integer> queue = new ArrayList<>();
        queue.add(1);
        for (int head = 0; head < queue.size(); head++) {
            int square = queue.get(head);
            for (int next = square + 1; next <= Math.min(square + 6, n * n); next++) {
                int value = cell(board, next);
                int dest = value == -1 ? next : value;
                if (moves[dest] == -1) {
                    moves[dest] = moves[square] + 1;
                    queue.add(dest);
                }
            }
        }
        return moves[n * n];
    }

    private int cell(int[][] board, int square) {
        int n = board.length;
        int r = (square - 1) / n, c = (square - 1) % n;
        return board[n - 1 - r][r % 2 == 0 ? c : n - 1 - c];
    }
}
