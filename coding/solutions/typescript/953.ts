function isAlienSorted(words: string[], order: string): boolean {
  const rank = new Map<string, number>();
  for (let i = 0; i < order.length; i++) rank.set(order[i], i);
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    let j = 0;
    while (true) {
      if (j === w1.length) break;
      if (j === w2.length) return false;
      if (w1[j] !== w2[j]) {
        if (rank.get(w1[j])! > rank.get(w2[j])!) return false;
        break;
      }
      j++;
    }
  }
  return true;
}
