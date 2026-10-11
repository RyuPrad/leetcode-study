function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") {
      stack.push(c);
    } else {
      if (stack.pop() !== map[c]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}
