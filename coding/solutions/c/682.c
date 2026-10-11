int calPoints(char** operations, int operationsSize) {
    int* stack = malloc(operationsSize * sizeof(int));
    int top = 0;
    for (int i = 0; i < operationsSize; i++) {
        char* op = operations[i];
        if (strcmp(op, "+") == 0) {
            stack[top] = stack[top - 1] + stack[top - 2];
            top++;
        } else if (strcmp(op, "D") == 0) {
            stack[top] = stack[top - 1] * 2;
            top++;
        } else if (strcmp(op, "C") == 0) {
            top--;
        } else {
            stack[top++] = atoi(op);
        }
    }
    int total = 0;
    for (int i = 0; i < top; i++) total += stack[i];
    free(stack);
    return total;
}
