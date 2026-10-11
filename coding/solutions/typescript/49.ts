function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const str of strs) {
    const count: number[] = new Array(26).fill(0);

    for (const char of str) {
      const index = char.charCodeAt(0) - 97;
      count[index]++;
    }

    const key = count.join("#");

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(str);
  }

  return Array.from(groups.values());
}
