// Coordinates are 0-1000: counts form a grid, and distinct points are kept for the scan.
typedef struct {
    int counts[1001][1001];
    int (*points)[2];
    int size;
    int capacity;
} DetectSquares;

DetectSquares* detectSquaresCreate() {
    DetectSquares* obj = calloc(1, sizeof(DetectSquares));
    obj->capacity = 16;
    obj->points = malloc(obj->capacity * sizeof *obj->points);
    return obj;
}

void detectSquaresAdd(DetectSquares* obj, int* point, int pointSize) {
    if (obj->counts[point[0]][point[1]]++ > 0) return;
    if (obj->size == obj->capacity) {
        obj->capacity *= 2;
        obj->points = realloc(obj->points, obj->capacity * sizeof *obj->points);
    }
    obj->points[obj->size][0] = point[0];
    obj->points[obj->size++][1] = point[1];
}

int detectSquaresCount(DetectSquares* obj, int* point, int pointSize) {
    int x = point[0], y = point[1];
    int res = 0;
    for (int i = 0; i < obj->size; i++) {
        int px = obj->points[i][0], py = obj->points[i][1];
        if (abs(px - x) == abs(py - y) && px != x && py != y) {
            res += obj->counts[px][py] * obj->counts[x][py] * obj->counts[px][y];
        }
    }
    return res;
}

void detectSquaresFree(DetectSquares* obj) {
    free(obj->points);
    free(obj);
}
