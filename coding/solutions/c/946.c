bool validateStackSequences(int* pushed, int pushedSize, int* popped, int poppedSize) {
    int* stack = malloc(pushedSize * sizeof(int));
    int top = 0;
    int j = 0;
    for (int i = 0; i < pushedSize; i++) {
        int value = pushed[i];
        stack[top++] = value;
        while (top > 0 && stack[top - 1] == popped[j]) {
            top--;
            j++;
        }
    }
    free(stack);
    return top == 0;
}
