function fullJustify(words: string[], maxWidth: number): string[] {
  const res: string[] = [];
  let i = 0;
  while (i < words.length) {
    let j = i, length = 0;
    while (j < words.length && length + words[j].length + (j - i) <= maxWidth) {
      length += words[j].length;
      j++;
    }
    const gaps = j - i - 1;
    let line = '';
    if (j === words.length || gaps === 0) {
      line = words.slice(i, j).join(' ');
      line += ' '.repeat(maxWidth - line.length);
    } else {
      const spaces = Math.floor((maxWidth - length) / gaps), extra = (maxWidth - length) % gaps;
      for (let k = i; k < j - 1; k++) {
        line += words[k] + ' '.repeat(spaces + (k - i < extra ? 1 : 0));
      }
      line += words[j - 1];
    }
    res.push(line);
    i = j;
  }
  return res;
}
