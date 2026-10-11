function openLock(deadends: string[], target: string): number {
  const dead = new Set(deadends);
  if (dead.has("0000")) return -1;
  if (target === "0000") return 0;
  const visited = new Set<string>(["0000"]);
  let queue: string[] = ["0000"];
  let turns = 0;
  while (queue.length > 0) {
    const next: string[] = [];
    for (const state of queue) {
      if (state === target) return turns;
      for (let i = 0; i < 4; i++) {
        for (const d of [1, -1]) {
          const digit = (Number(state[i]) + d + 10) % 10;
          const nextState = state.slice(0, i) + digit + state.slice(i + 1);
          if (!visited.has(nextState) && !dead.has(nextState)) {
            visited.add(nextState);
            next.push(nextState);
          }
        }
      }
    }
    queue = next;
    turns++;
  }
  return -1;
}
