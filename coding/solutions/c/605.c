bool canPlaceFlowers(int* flowerbed, int flowerbedSize, int n) {
    int count = 0;
    for (int i = 0; i < flowerbedSize; i++) {
        bool leftEmpty = i == 0 || flowerbed[i - 1] == 0;
        bool rightEmpty = i == flowerbedSize - 1 || flowerbed[i + 1] == 0;
        if (flowerbed[i] == 0 && leftEmpty && rightEmpty) {
            flowerbed[i] = 1;
            count++;
        }
    }
    return count >= n;
}
