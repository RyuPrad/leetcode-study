function splitString(s: string): boolean {
  const dfs = (start: number, prev: number): boolean => {
    if (start === s.length) {
      return true;
    }
    let value = 0;
    for (let end = start; end < s.length; end++) {
      value = value * 10 + Number(s[end]);
      if (value >= prev) {
        break;
      }
      if (value === prev - 1 && dfs(end + 1, value)) {
        return true;
      }
    }
    return false;
  };
  let first = 0;
  for (let cut = 0; cut < s.length - 1; cut++) {
    first = first * 10 + Number(s[cut]);
    if (first >= 1e10) {
      break;
    }
    if (dfs(cut + 1, first)) {
      return true;
    }
  }
  return false;
}
