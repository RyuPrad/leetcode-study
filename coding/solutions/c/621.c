// With at most 26 task kinds, the heap is a plain array searched for its largest count.
int leastInterval(char* tasks, int tasksSize, int n) {
    int heap[26], heapSize = 0, freq[26] = { 0 };
    for (int i = 0; i < tasksSize; i++) freq[tasks[i] - 'A']++;
    for (int i = 0; i < 26; i++) if (freq[i] > 0) heap[heapSize++] = freq[i];
    int queue[26][2], head = 0, tail = 0; // [count, time it can run again]
    int time = 0;
    while (heapSize || head < tail) {
        time++;
        if (heapSize) {
            int best = 0;
            for (int i = 1; i < heapSize; i++) if (heap[i] > heap[best]) best = i;
            int cnt = heap[best] - 1;
            heap[best] = heap[--heapSize];
            if (cnt > 0) { queue[tail % 26][0] = cnt; queue[tail % 26][1] = time + n; tail++; }
        }
        if (head < tail && queue[head % 26][1] == time) {
            heap[heapSize++] = queue[head % 26][0];
            head++;
        }
    }
    return time;
}
