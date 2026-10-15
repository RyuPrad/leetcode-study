function minStickers(stickers: string[], target: string): number {
  const memo = new Map<string, number>([['', 0]]);
  const solve = (rest: string): number => {
    if (memo.has(rest)) {
      return memo.get(rest)!;
    }
    let best = Infinity;
    for (const sticker of stickers) {
      if (!sticker.includes(rest[0])) {
        continue;
      }
      let next = rest;
      for (const ch of sticker) {
        next = next.replace(ch, '');
      }
      best = Math.min(best, 1 + solve(next));
    }
    memo.set(rest, best);
    return best;
  };
  const res = solve([...target].sort().join(''));
  return res === Infinity ? -1 : res;
}
