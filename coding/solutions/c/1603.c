typedef struct {
    int spaces[4];
} ParkingSystem;

ParkingSystem* parkingSystemCreate(int big, int medium, int small) {
    ParkingSystem* obj = malloc(sizeof(ParkingSystem));
    obj->spaces[0] = 0;
    obj->spaces[1] = big;
    obj->spaces[2] = medium;
    obj->spaces[3] = small;
    return obj;
}

bool parkingSystemAddCar(ParkingSystem* obj, int carType) {
    if (obj->spaces[carType] == 0) {
        return false;
    }
    obj->spaces[carType]--;
    return true;
}

void parkingSystemFree(ParkingSystem* obj) {
    free(obj);
}
