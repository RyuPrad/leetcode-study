static char* urls[1000];
static int urlCount = 0;

char* encode(char* longUrl) {
    urls[urlCount] = strdup(longUrl);
    char* shortUrl = malloc(64);
    sprintf(shortUrl, "http://tinyurl.com/%d", urlCount);
    urlCount++;
    return shortUrl;
}

char* decode(char* shortUrl) {
    int id = atoi(strrchr(shortUrl, '/') + 1);
    return urls[id];
}
