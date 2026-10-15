char* pushDominoes(char* dominoes) {
    int n = strlen(dominoes);
    int* forces = calloc(n, sizeof(int));
    int force = 0;
    for (int i = 0; i < n; i++) {
        if (dominoes[i] == 'R') force = n;
        else if (dominoes[i] == 'L') force = 0;
        else force = force - 1 > 0 ? force - 1 : 0;
        forces[i] += force;
    }
    force = 0;
    for (int i = n - 1; i >= 0; i--) {
        if (dominoes[i] == 'L') force = n;
        else if (dominoes[i] == 'R') force = 0;
        else force = force - 1 > 0 ? force - 1 : 0;
        forces[i] -= force;
    }
    char* res = malloc(n + 1);
    for (int i = 0; i < n; i++) res[i] = forces[i] > 0 ? 'R' : forces[i] < 0 ? 'L' : '.';
    res[n] = '\0';
    free(forces);
    return res;
}
