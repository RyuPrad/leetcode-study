function wordPattern(pattern: string, s: string): boolean {
  const words = s.split(' ');
  if (words.length !== pattern.length) {
    return false;
  }
  const charToWord = new Map<string, string>(), wordToChar = new Map<string, string>();
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i], word = words[i];
    if ((charToWord.has(c) && charToWord.get(c) !== word) || (wordToChar.has(word) && wordToChar.get(word) !== c)) {
      return false;
    }
    charToWord.set(c, word);
    wordToChar.set(word, c);
  }
  return true;
}
