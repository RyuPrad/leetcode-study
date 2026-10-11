bool mergeTriplets(int** triplets, int tripletsSize, int* tripletsColSize, int* target, int targetSize) {
    bool a = false, b = false, c = false;
    for (int i = 0; i < tripletsSize; i++) {
        int* t = triplets[i];
        if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) {
            if (t[0] == target[0]) a = true;
            if (t[1] == target[1]) b = true;
            if (t[2] == target[2]) c = true;
        }
    }
    return a && b && c;
}
