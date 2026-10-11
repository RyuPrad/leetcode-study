// Each level keeps the text decoded so far and the repeat count for its brackets.
typedef struct { char* text; int length; int capacity; int repeat; } Level;

static void append(Level* level, const char* text, int length) {
    if (level->length + length + 1 > level->capacity) {
        level->capacity = (level->length + length + 1) * 2;
        level->text = realloc(level->text, level->capacity);
    }
    memcpy(level->text + level->length, text, length);
    level->length += length;
    level->text[level->length] = '\0';
}

char* decodeString(char* s) {
    Level stack[32];
    int top = 0;
    stack[0] = (Level){ calloc(16, 1), 0, 16, 0 };
    int curNum = 0;
    for (; *s; s++) {
        char c = *s;
        if (c >= '0' && c <= '9') {
            curNum = curNum * 10 + (c - '0');
        } else if (c == '[') {
            stack[top].repeat = curNum;
            stack[++top] = (Level){ calloc(16, 1), 0, 16, 0 };
            curNum = 0;
        } else if (c == ']') {
            Level inner = stack[top--];
            for (int r = 0; r < stack[top].repeat; r++) append(&stack[top], inner.text, inner.length);
            free(inner.text);
        } else {
            append(&stack[top], &c, 1);
        }
    }
    return stack[0].text;
}
