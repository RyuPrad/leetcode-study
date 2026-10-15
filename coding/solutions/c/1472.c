struct Page {
    char* url;
    struct Page* prev;
    struct Page* next;
};

typedef struct {
    struct Page* curr;
} BrowserHistory;

static struct Page* newPage(char* url, struct Page* prev) {
    struct Page* page = malloc(sizeof(struct Page));
    page->url = malloc(strlen(url) + 1);
    strcpy(page->url, url);
    page->prev = prev;
    page->next = NULL;
    return page;
}

BrowserHistory* browserHistoryCreate(char* homepage) {
    BrowserHistory* obj = malloc(sizeof(BrowserHistory));
    obj->curr = newPage(homepage, NULL);
    return obj;
}

void browserHistoryVisit(BrowserHistory* obj, char* url) {
    obj->curr->next = newPage(url, obj->curr);
    obj->curr = obj->curr->next;
}

char* browserHistoryBack(BrowserHistory* obj, int steps) {
    while (steps > 0 && obj->curr->prev) {
        obj->curr = obj->curr->prev;
        steps--;
    }
    return obj->curr->url;
}

char* browserHistoryForward(BrowserHistory* obj, int steps) {
    while (steps > 0 && obj->curr->next) {
        obj->curr = obj->curr->next;
        steps--;
    }
    return obj->curr->url;
}

void browserHistoryFree(BrowserHistory* obj) {
    struct Page* page = obj->curr;
    while (page->prev) {
        page = page->prev;
    }
    while (page) {
        struct Page* next = page->next;
        free(page->url);
        free(page);
        page = next;
    }
    free(obj);
}
