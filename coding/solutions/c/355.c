// Tweets are stored in posting order, so the newest are found by scanning backwards.
#define MAX_USERS 501

typedef struct {
    int (*tweets)[2]; // [userId, tweetId]
    int count;
    int capacity;
    bool following[MAX_USERS][MAX_USERS];
} Twitter;

Twitter* twitterCreate() {
    Twitter* obj = calloc(1, sizeof(Twitter));
    obj->capacity = 64;
    obj->tweets = malloc(obj->capacity * sizeof *obj->tweets);
    return obj;
}

void twitterPostTweet(Twitter* obj, int userId, int tweetId) {
    if (obj->count == obj->capacity) {
        obj->capacity *= 2;
        obj->tweets = realloc(obj->tweets, obj->capacity * sizeof *obj->tweets);
    }
    obj->tweets[obj->count][0] = userId;
    obj->tweets[obj->count][1] = tweetId;
    obj->count++;
}

int* twitterGetNewsFeed(Twitter* obj, int userId, int* retSize) {
    int* res = malloc(10 * sizeof(int));
    *retSize = 0;
    for (int i = obj->count - 1; i >= 0 && *retSize < 10; i--) {
        int author = obj->tweets[i][0];
        if (author == userId || obj->following[userId][author]) res[(*retSize)++] = obj->tweets[i][1];
    }
    return res;
}

void twitterFollow(Twitter* obj, int followerId, int followeeId) {
    obj->following[followerId][followeeId] = true;
}

void twitterUnfollow(Twitter* obj, int followerId, int followeeId) {
    obj->following[followerId][followeeId] = false;
}

void twitterFree(Twitter* obj) {
    free(obj->tweets);
    free(obj);
}
