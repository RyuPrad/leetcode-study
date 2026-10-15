typedef struct {
    int value;
    int index;
    UT_hash_handle hh;
} Slot;

typedef struct {
    int* values;
    int size;
    int capacity;
    Slot* indexOf;
} RandomizedSet;

RandomizedSet* randomizedSetCreate() {
    RandomizedSet* obj = malloc(sizeof(RandomizedSet));
    obj->capacity = 16;
    obj->values = malloc(obj->capacity * sizeof(int));
    obj->size = 0;
    obj->indexOf = NULL;
    return obj;
}

bool randomizedSetInsert(RandomizedSet* obj, int val) {
    Slot* slot;
    HASH_FIND_INT(obj->indexOf, &val, slot);
    if (slot) {
        return false;
    }
    slot = malloc(sizeof(Slot));
    slot->value = val;
    slot->index = obj->size;
    HASH_ADD_INT(obj->indexOf, value, slot);
    if (obj->size == obj->capacity) obj->values = realloc(obj->values, (obj->capacity *= 2) * sizeof(int));
    obj->values[obj->size++] = val;
    return true;
}

bool randomizedSetRemove(RandomizedSet* obj, int val) {
    Slot* slot;
    HASH_FIND_INT(obj->indexOf, &val, slot);
    if (!slot) {
        return false;
    }
    int index = slot->index, last = obj->values[obj->size - 1];
    obj->values[index] = last;
    Slot* lastSlot;
    HASH_FIND_INT(obj->indexOf, &last, lastSlot);
    lastSlot->index = index;
    obj->size--;
    HASH_DEL(obj->indexOf, slot);
    free(slot);
    return true;
}

int randomizedSetGetRandom(RandomizedSet* obj) {
    return obj->values[rand() % obj->size];
}

void randomizedSetFree(RandomizedSet* obj) {
    Slot *slot, *tmp;
    HASH_ITER(hh, obj->indexOf, slot, tmp) {
        HASH_DEL(obj->indexOf, slot);
        free(slot);
    }
    free(obj->values);
    free(obj);
}
