static int** prereq;
static int prereqCount;
static bool* reach;
static int courses;

static void dfs(int src, int node) {
    for (int e = 0; e < prereqCount; e++) {
        if (prereq[e][0] != node) continue;
        int nei = prereq[e][1];
        if (!reach[src * courses + nei]) {
            reach[src * courses + nei] = true;
            dfs(src, nei);
        }
    }
}

bool* checkIfPrerequisite(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize, int** queries, int queriesSize, int* queriesColSize, int* returnSize) {
    prereq = prerequisites;
    prereqCount = prerequisitesSize;
    courses = numCourses;
    reach = calloc(numCourses * numCourses, sizeof(bool));
    for (int i = 0; i < numCourses; i++) dfs(i, i);
    bool* res = malloc((queriesSize ? queriesSize : 1) * sizeof(bool));
    for (int q = 0; q < queriesSize; q++) res[q] = reach[queries[q][0] * numCourses + queries[q][1]];
    free(reach);
    *returnSize = queriesSize;
    return res;
}
