function maxLength(arr: string[]): number {
  let res = 0;
  const backtrack = (index: number, used: string): void => {
    res = Math.max(res, used.length);
    for (let i = index; i < arr.length; i++) {
      const candidate = used + arr[i];
      if (new Set(candidate).size === candidate.length) {
        backtrack(i + 1, candidate);
      }
    }
  };
  backtrack(0, '');
  return res;
}
