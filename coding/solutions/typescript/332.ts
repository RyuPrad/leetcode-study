function findItinerary(tickets: string[][]): string[] {
  const adj = new Map<string, string[]>();
  for (const [from, to] of tickets) { if (!adj.has(from)) adj.set(from, []); adj.get(from)!.push(to); }
  for (const [, dests] of adj) dests.sort();
  const res: string[] = [];
  const visit = (airport: string): void => {
    const dests = adj.get(airport) || [];
    while (dests.length > 0) { const next = dests.shift()!; visit(next); }
    res.push(airport);
  };
  visit("JFK");
  return res.reverse();
}
