int* asteroidCollision(int* asteroids, int asteroidsSize, int* returnSize) {
    int* stack = malloc((asteroidsSize ? asteroidsSize : 1) * sizeof(int));
    int size = 0;
    for (int i = 0; i < asteroidsSize; i++) {
        int a = asteroids[i];
        bool alive = true;
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
    *returnSize = size;
    return stack;
}
