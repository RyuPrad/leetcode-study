int hammingWeight(int n) {
    unsigned int bits = (unsigned int)n;
    int count = 0;
    while (bits != 0) {
        bits = bits & (bits - 1);
        count++;
    }
    return count;
}
