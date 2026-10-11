function canReach(s: string, minJump: number, maxJump: number): boolean {
  const n = s.length;
  const dp: boolean[] = new Array(n).fill(false);
  dp[0] = true;
  let windowCount = 0;
  for (let i = 1; i < n; i++) {
    if (i >= minJump) windowCount += dp[i - minJump] ? 1 : 0;
    if (i > maxJump) windowCount -= dp[i - maxJump - 1] ? 1 : 0;
    dp[i] = windowCount > 0 && s[i] === "0";
  }
  return dp[n - 1];
}
