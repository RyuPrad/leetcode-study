function makesquare(matchsticks: number[]): boolean {
  const total = matchsticks.reduce((a, b) => a + b, 0);
  if (total % 4 !== 0) return false;
  const side = total / 4;
  matchsticks.sort((a, b) => b - a);
  const sides = [0, 0, 0, 0];
  function dfs(i: number): boolean {
    if (i === matchsticks.length) return sides.every(s => s === side);
    for (let j = 0; j < 4; j++) {
      if (sides[j] + matchsticks[i] <= side) {
        sides[j] += matchsticks[i];
        if (dfs(i + 1)) return true;
        sides[j] -= matchsticks[i];
      }
      if (sides[j] === 0) break;
    }
    return false;
  }
  return dfs(0);
}
