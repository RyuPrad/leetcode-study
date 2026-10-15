typedef struct {
    int id;
    char station[16];
    int time;
    UT_hash_handle hh;
} Trip;

typedef struct {
    char route[33];
    long long sum;
    int count;
    UT_hash_handle hh;
} Total;

typedef struct {
    Trip* checkIns;
    Total* totals;
} UndergroundSystem;

UndergroundSystem* undergroundSystemCreate() {
    UndergroundSystem* obj = malloc(sizeof(UndergroundSystem));
    obj->checkIns = NULL;
    obj->totals = NULL;
    return obj;
}

void undergroundSystemCheckIn(UndergroundSystem* obj, int id, char* stationName, int t) {
    Trip* trip = malloc(sizeof(Trip));
    trip->id = id;
    strcpy(trip->station, stationName);
    trip->time = t;
    HASH_ADD_INT(obj->checkIns, id, trip);
}

void undergroundSystemCheckOut(UndergroundSystem* obj, int id, char* stationName, int t) {
    Trip* trip;
    HASH_FIND_INT(obj->checkIns, &id, trip);
    HASH_DEL(obj->checkIns, trip);
    char route[33];
    sprintf(route, "%s,%s", trip->station, stationName);
    Total* total;
    HASH_FIND_STR(obj->totals, route, total);
    if (!total) {
        total = calloc(1, sizeof(Total));
        strcpy(total->route, route);
        HASH_ADD_STR(obj->totals, route, total);
    }
    total->sum += t - trip->time;
    total->count++;
    free(trip);
}

double undergroundSystemGetAverageTime(UndergroundSystem* obj, char* startStation, char* endStation) {
    char route[33];
    sprintf(route, "%s,%s", startStation, endStation);
    Total* total;
    HASH_FIND_STR(obj->totals, route, total);
    return (double) total->sum / total->count;
}

void undergroundSystemFree(UndergroundSystem* obj) {
    Trip *trip, *nextTrip;
    HASH_ITER(hh, obj->checkIns, trip, nextTrip) {
        HASH_DEL(obj->checkIns, trip);
        free(trip);
    }
    Total *total, *nextTotal;
    HASH_ITER(hh, obj->totals, total, nextTotal) {
        HASH_DEL(obj->totals, total);
        free(total);
    }
    free(obj);
}
