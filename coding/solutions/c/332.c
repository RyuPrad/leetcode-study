// Tickets sorted by (from, to); each airport's destinations are then a contiguous, ordered run.
static char*** sorted;
static bool* used;
static int ticketCount;
static char** res;
static int count;

static int byRoute(const void* a, const void* b) {
    char** x = *(char** const*)a;
    char** y = *(char** const*)b;
    int c = strcmp(x[0], y[0]);
    return c ? c : strcmp(x[1], y[1]);
}

static void visit(char* airport) {
    for (int i = 0; i < ticketCount; i++) {
        if (!used[i] && strcmp(sorted[i][0], airport) == 0) {
            used[i] = true;
            visit(sorted[i][1]);
            i = -1; // take the next smallest unused destination
        }
    }
    res[count++] = airport;
}

char** findItinerary(char*** tickets, int ticketsSize, int* ticketsColSize, int* returnSize) {
    ticketCount = ticketsSize;
    sorted = malloc(ticketsSize * sizeof(char**));
    memcpy(sorted, tickets, ticketsSize * sizeof(char**));
    qsort(sorted, ticketsSize, sizeof(char**), byRoute);
    used = calloc(ticketsSize, sizeof(bool));
    res = malloc((ticketsSize + 1) * sizeof(char*));
    count = 0;
    visit("JFK");
    for (int i = 0, j = count - 1; i < j; i++, j--) {
        char* t = res[i]; res[i] = res[j]; res[j] = t;
    }
    free(used);
    free(sorted);
    *returnSize = count;
    return res;
}
