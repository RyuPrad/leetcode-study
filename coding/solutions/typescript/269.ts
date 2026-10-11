function alienOrder(words: string[]): string {
  const adj = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();
  for (const w of words) {
    for (const ch of w) { if (!adj.has(ch)) adj.set(ch, new Set()); if (!indegree.has(ch)) indegree.set(ch, 0); }
  }
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);
    if (w1.length > w2.length && w1.slice(0, minLen) === w2.slice(0, minLen)) return "";
    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        if (!adj.get(w1[j])!.has(w2[j])) { adj.get(w1[j])!.add(w2[j]); indegree.set(w2[j], indegree.get(w2[j])! + 1); }
        break;
      }
    }
  }
  const queue: string[] = [];
  for (const [ch, d] of indegree) if (d === 0) queue.push(ch);
  let res = "", head = 0;
  while (head < queue.length) {
    const ch = queue[head++];
    res += ch;
    for (const nei of adj.get(ch)!) { indegree.set(nei, indegree.get(nei)! - 1); if (indegree.get(nei) === 0) queue.push(nei); }
  }
  return res.length === indegree.size ? res : "";
}
