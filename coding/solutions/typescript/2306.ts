function distinctNames(ideas: string[]): number {
  const groups = new Map<string, Set<string>>();
  for (const idea of ideas) {
    const first = idea[0], suffix = idea.slice(1);
    if (!groups.has(first)) {
      groups.set(first, new Set());
    }
    groups.get(first)!.add(suffix);
  }
  const letters = [...groups.keys()];
  let res = 0;
  for (let a = 0; a < letters.length; a++) {
    for (let b = a + 1; b < letters.length; b++) {
      const setA = groups.get(letters[a])!, setB = groups.get(letters[b])!;
      let shared = 0;
      for (const suffix of setA) {
        if (setB.has(suffix)) {
          shared++;
        }
      }
      res += 2 * (setA.size - shared) * (setB.size - shared);
    }
  }
  return res;
}
