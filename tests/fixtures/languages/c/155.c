typedef struct { int* values; int* mins; int size; } MinStack;
MinStack* minStackCreate() {
    MinStack* s = malloc(sizeof *s);
    s->values = malloc(sizeof(int) * 30001); s->mins = malloc(sizeof(int) * 30001); s->size = 0;
    return s;
}
void minStackPush(MinStack* obj, int val) {
    obj->values[obj->size] = val;
    obj->mins[obj->size] = obj->size && obj->mins[obj->size - 1] < val ? obj->mins[obj->size - 1] : val;
    obj->size++;
}
void minStackPop(MinStack* obj) { obj->size--; }
int minStackTop(MinStack* obj) { return obj->values[obj->size - 1]; }
int minStackGetMin(MinStack* obj) { return obj->mins[obj->size - 1]; }
void minStackFree(MinStack* obj) { free(obj->values); free(obj->mins); free(obj); }
