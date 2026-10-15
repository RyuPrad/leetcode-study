function restoreIpAddresses(s: string): string[] {
  const res: string[] = [];
  const parts: string[] = [];
  const backtrack = (start: number): void => {
    if (parts.length === 4) {
      if (start === s.length) {
        res.push(parts.join('.'));
      }
      return;
    }
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const part = s.slice(start, start + len);
      if ((part.length > 1 && part[0] === '0') || Number(part) > 255) {
        break;
      }
      parts.push(part);
      backtrack(start + len);
      parts.pop();
    }
  };
  backtrack(0);
  return res;
}
