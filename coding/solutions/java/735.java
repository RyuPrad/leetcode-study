class Solution {
    public int[] asteroidCollision(int[] asteroids) {
        int[] stack = new int[asteroids.length];
        int size = 0;
        for (int a : asteroids) {
            boolean alive = true;
            while (alive && a < 0 && size > 0 && stack[size - 1] > 0) {
                int top = stack[size - 1];
                if (top < -a) {
                    size--;
                } else if (top == -a) {
                    size--;
                    alive = false;
                } else {
                    alive = false;
                }
            }
            if (alive) {
                stack[size++] = a;
            }
        }
        return Arrays.copyOf(stack, size);
    }
}
