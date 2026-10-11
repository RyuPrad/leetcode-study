function partition(s: string): string[][] {
  const res: string[][] = [];
  const path: string[] = [];
  function isPal(l: number, r: number): boolean {
    while (l < r) {
      if (s[l] !== s[r]) return false;
      l++; r--;
    }
    return true;
  }
  function dfs(start: number): void {
    if (start === s.length) {
      res.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (isPal(start, end)) {
        path.push(s.substring(start, end + 1));
        dfs(end + 1);
        path.pop();
      }
    }
  }
  dfs(0);
  return res;
}
