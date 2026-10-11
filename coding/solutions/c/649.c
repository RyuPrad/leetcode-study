char* predictPartyVictory(char* senate) {
    int n = strlen(senate);
    // Each senator re-queues at most once per round; 2n slots per queue are enough with wraparound.
    int capacity = 2 * n + 1;
    int* radiant = malloc(capacity * sizeof(int));
    int* dire = malloc(capacity * sizeof(int));
    int rHead = 0, rTail = 0, dHead = 0, dTail = 0;
    for (int i = 0; i < n; i++) {
        if (senate[i] == 'R') radiant[rTail++ % capacity] = i;
        else dire[dTail++ % capacity] = i;
    }
    while (rHead < rTail && dHead < dTail) {
        int r = radiant[rHead++ % capacity];
        int d = dire[dHead++ % capacity];
        if (r < d) radiant[rTail++ % capacity] = r + n;
        else dire[dTail++ % capacity] = d + n;
    }
    bool radiantWins = rHead < rTail;
    free(radiant);
    free(dire);
    char* res = malloc(8);
    strcpy(res, radiantWins ? "Radiant" : "Dire");
    return res;
}
