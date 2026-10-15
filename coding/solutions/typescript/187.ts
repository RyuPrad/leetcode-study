function findRepeatedDnaSequences(s: string): string[] {
  const seen = new Set<string>(), repeated = new Set<string>();
  for (let i = 0; i + 10 <= s.length; i++) {
    const sequence = s.slice(i, i + 10);
    if (seen.has(sequence)) {
      repeated.add(sequence);
    } else {
      seen.add(sequence);
    }
  }
  return [...repeated];
}
