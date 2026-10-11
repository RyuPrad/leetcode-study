int largestRectangleArea(int* heights, int heightsSize) {
    int* stack = malloc((heightsSize + 1) * sizeof(int));
    int top = 0;
    int maxArea = 0;
    for (int i = 0; i <= heightsSize; i++) {
        int h = i == heightsSize ? 0 : heights[i];
        while (top && heights[stack[top - 1]] >= h) {
            int height = heights[stack[--top]];
            int width = top == 0 ? i : i - stack[top - 1] - 1;
            if (height * width > maxArea) maxArea = height * width;
        }
        stack[top++] = i;
    }
    free(stack);
    return maxArea;
}
