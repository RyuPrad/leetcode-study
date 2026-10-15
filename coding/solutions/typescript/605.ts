function canPlaceFlowers(flowerbed: number[], n: number): boolean {
  let count = 0;
  for (let i = 0; i < flowerbed.length; i++) {
    const leftEmpty = i === 0 || flowerbed[i - 1] === 0;
    const rightEmpty = i === flowerbed.length - 1 || flowerbed[i + 1] === 0;
    if (flowerbed[i] === 0 && leftEmpty && rightEmpty) {
      flowerbed[i] = 1;
      count++;
    }
  }
  return count >= n;
}
