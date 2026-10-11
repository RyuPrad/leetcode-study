function isNStraightHand(hand: number[], groupSize: number): boolean {
  if (hand.length % groupSize !== 0) return false;
  const count = new Map<number, number>();
  for (const card of hand) count.set(card, (count.get(card) || 0) + 1);
  const keys = [...count.keys()].sort((a, b) => a - b);
  for (const start of keys) {
    const need = count.get(start)!;
    if (need > 0) {
      for (let card = start; card < start + groupSize; card++) {
        if ((count.get(card) || 0) < need) return false;
        count.set(card, count.get(card)! - need);
      }
    }
  }
  return true;
}
