function lengthOfLastWord(s: string): number {
  let i = s.length - 1, length = 0;
  while (i >= 0 && s[i] === ' ') {
    i--;
  }
  while (i >= 0 && s[i] !== ' ') {
    length++;
    i--;
  }
  return length;
}
