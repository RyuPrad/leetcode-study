function totalFruit(fruits: number[]): number {
  const count = new Map<number, number>();
  let left = 0, res = 0;
  for (let right = 0; right < fruits.length; right++) {
    count.set(fruits[right], (count.get(fruits[right]) || 0) + 1);
    while (count.size > 2) {
      const fruit = fruits[left];
      count.set(fruit, count.get(fruit)! - 1);
      if (count.get(fruit) === 0) {
        count.delete(fruit);
      }
      left++;
    }
    res = Math.max(res, right - left + 1);
  }
  return res;
}
