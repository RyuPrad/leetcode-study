int getSum(int a, int b) {
    // Unsigned arithmetic makes shifting the carry well defined for negative values.
    unsigned int x = (unsigned int)a, y = (unsigned int)b;
    while (y != 0) {
        unsigned int carry = (x & y) << 1;
        x = x ^ y;
        y = carry;
    }
    return (int)x;
}
