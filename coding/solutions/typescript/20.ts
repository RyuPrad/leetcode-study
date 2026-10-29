function isValid(s: string): boolean {
  const stack: string[] = [];
  const map = new Map<string, string>([[")", "("], ["]", "["], ["}", "{"]]);
  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") {
      stack.push(c);
    } else {
      if (stack.pop() !== map.get(c)) {
        return false;
      }
    }
  }
  return stack.length === 0;
}
