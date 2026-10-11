bool canFinish(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize) {
    int** adj = malloc(numCourses * sizeof(int*));
    int* adjSize = calloc(numCourses, sizeof(int));
    int* indegree = calloc(numCourses, sizeof(int));
    for (int i = 0; i < numCourses; i++) adj[i] = malloc((prerequisitesSize ? prerequisitesSize : 1) * sizeof(int));
    for (int e = 0; e < prerequisitesSize; e++) {
        int course = prerequisites[e][0], pre = prerequisites[e][1];
        adj[pre][adjSize[pre]++] = course;
        indegree[course]++;
    }
    int* queue = malloc(numCourses * sizeof(int));
    int head = 0, tail = 0;
    for (int i = 0; i < numCourses; i++) {
        if (indegree[i] == 0) queue[tail++] = i;
    }
    while (head < tail) {
        int node = queue[head++];
        for (int k = 0; k < adjSize[node]; k++) {
            int next = adj[node][k];
            indegree[next]--;
            if (indegree[next] == 0) queue[tail++] = next;
        }
    }
    for (int i = 0; i < numCourses; i++) free(adj[i]);
    free(adj); free(adjSize); free(indegree);
    free(queue);
    return tail == numCourses;
}
