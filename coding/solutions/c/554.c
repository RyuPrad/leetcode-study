typedef struct {
    int position;
    int count;
    UT_hash_handle hh;
} Edge;

int leastBricks(int** wall, int wallSize, int* wallColSize) {
    Edge* edges = NULL;
    int best = 0;
    for (int r = 0; r < wallSize; r++) {
        int* row = wall[r];
        int position = 0;
        for (int i = 0; i < wallColSize[r] - 1; i++) {
            position += row[i];
            Edge* edge;
            HASH_FIND_INT(edges, &position, edge);
            if (!edge) {
                edge = calloc(1, sizeof(Edge));
                edge->position = position;
                HASH_ADD_INT(edges, position, edge);
            }
            edge->count++;
            if (edge->count > best) best = edge->count;
        }
    }
    Edge *edge, *tmp;
    HASH_ITER(hh, edges, edge, tmp) {
        HASH_DEL(edges, edge);
        free(edge);
    }
    return wallSize - best;
}
