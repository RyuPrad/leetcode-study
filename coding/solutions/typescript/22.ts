function generateParenthesis(n: number): string[] {
  const res: string[] = [];
  const stack: string[] = [];
  function backtrack(open: number, close: number): void {
    if (stack.length === 2 * n) {
      res.push(stack.join(""));
      return;
    }
    if (open < n) {
      stack.push("(");
      backtrack(open + 1, close);
      stack.pop();
    }
    if (close < open) {
      stack.push(")");
      backtrack(open, close + 1);
      stack.pop();
    }
  }
  backtrack(0, 0);
  return res;
}
