int leastInterval(char* tasks, int tasksSize, int n) {
    int counts[26] = {0}, most = 0, ties = 0;
    for (int i = 0; i < tasksSize; i++) counts[tasks[i] - 'A']++;
    for (int i = 0; i < 26; i++) if (counts[i] > most) most = counts[i];
    for (int i = 0; i < 26; i++) if (counts[i] == most) ties++;
    int frame = (most - 1) * (n + 1) + ties;
    return frame > tasksSize ? frame : tasksSize;
}
