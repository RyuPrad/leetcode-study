int numUniqueEmails(char** emails, int emailsSize) {
    char** unique = malloc(emailsSize * sizeof(char*));
    int count = 0;
    for (int e = 0; e < emailsSize; e++) {
        char* email = emails[e];
        char* domain = strchr(email, '@');
        char* name = malloc(strlen(email) + 1);
        int length = 0;
        for (char* p = email; p < domain && *p != '+'; p++) {
            if (*p != '.') name[length++] = *p;
        }
        strcpy(name + length, domain);
        bool seen = false;
        for (int k = 0; k < count; k++) {
            if (strcmp(unique[k], name) == 0) seen = true;
        }
        if (!seen) unique[count++] = name;
        else free(name);
    }
    for (int k = 0; k < count; k++) free(unique[k]);
    free(unique);
    return count;
}
