int maxTurbulenceSize(int* arr, int arrSize) {
    int ans = 1;
    int inc = 1, dec = 1;
    for (int i = 1; i < arrSize; i++) {
        if (arr[i] > arr[i - 1]) { inc = dec + 1; dec = 1; }
        else if (arr[i] < arr[i - 1]) { dec = inc + 1; inc = 1; }
        else { inc = 1; dec = 1; }
        if (inc > ans) ans = inc;
        if (dec > ans) ans = dec;
    }
    return ans;
}
