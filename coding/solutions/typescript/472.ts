function findAllConcatenatedWordsInADict(words: string[]): string[] {
  const dict = new Set(words);
  const res: string[] = [];
  for (const word of words) {
    const n = word.length;
    const dp: boolean[] = new Array(n + 1).fill(false);
    dp[0] = true;
    for (let end = 1; end <= n; end++) {
      for (let start = 0; start < end; start++) {
        if (start === 0 && end === n) {
          continue;
        }
        if (dp[start] && dict.has(word.slice(start, end))) {
          dp[end] = true;
          break;
        }
      }
    }
    if (dp[n]) {
      res.push(word);
    }
  }
  return res;
}
