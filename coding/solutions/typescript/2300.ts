function successfulPairs(spells: number[], potions: number[], success: number): number[] {
  potions.sort((a, b) => a - b);
  const res: number[] = [];
  for (const spell of spells) {
    let left = 0, right = potions.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (spell * potions[mid] >= success) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    res.push(potions.length - left);
  }
  return res;
}
