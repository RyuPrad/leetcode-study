// Lock states are the numbers 0000-9999, so plain arrays replace the sets.
int openLock(char** deadends, int deadendsSize, char* target) {
    bool dead[10000] = { false }, visited[10000] = { false };
    for (int i = 0; i < deadendsSize; i++) dead[atoi(deadends[i])] = true;
    int goal = atoi(target);
    if (dead[0]) return -1;
    if (goal == 0) return 0;
    int* queue = malloc(10000 * sizeof(int));
    int head = 0, tail = 0, turns = 0;
    queue[tail++] = 0;
    visited[0] = true;
    const int place[4] = { 1000, 100, 10, 1 };
    while (head < tail) {
        int levelEnd = tail;
        while (head < levelEnd) {
            int state = queue[head++];
            if (state == goal) { free(queue); return turns; }
            for (int i = 0; i < 4; i++) {
                int digit = state / place[i] % 10;
                for (int d = 1; d >= -1; d -= 2) {
                    int nextState = state + ((digit + d + 10) % 10 - digit) * place[i];
                    if (!visited[nextState] && !dead[nextState]) {
                        visited[nextState] = true;
                        queue[tail++] = nextState;
                    }
                }
            }
        }
        turns++;
    }
    free(queue);
    return -1;
}
