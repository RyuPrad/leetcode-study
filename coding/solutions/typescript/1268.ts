function suggestedProducts(products: string[], searchWord: string): string[][] {
  products.sort();
  const res: string[][] = [];
  let prefix = '';
  for (const c of searchWord) {
    prefix += c;
    let left = 0, right = products.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (products[mid] < prefix) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    const matches: string[] = [];
    for (let i = left; i < Math.min(left + 3, products.length); i++) {
      if (products[i].startsWith(prefix)) {
        matches.push(products[i]);
      }
    }
    res.push(matches);
  }
  return res;
}
