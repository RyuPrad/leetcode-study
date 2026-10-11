function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  let queue: string[] = [beginWord];
  const visited = new Set<string>([beginWord]);
  let level = 1;
  while (queue.length > 0) {
    const next: string[] = [];
    for (const word of queue) {
      if (word === endWord) return level;
      for (let i = 0; i < word.length; i++) {
        for (let c = 97; c <= 122; c++) {
          const ch = String.fromCharCode(c);
          const cand = word.slice(0, i) + ch + word.slice(i + 1);
          if (words.has(cand) && !visited.has(cand)) {
            visited.add(cand);
            next.push(cand);
          }
        }
      }
    }
    queue = next;
    level++;
  }
  return 0;
}
