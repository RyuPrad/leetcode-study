function removeDuplicates(s: string, k: number): string {
  const stack: [string, number][] = [];
  for (const c of s) {
    if (stack.length > 0 && stack[stack.length - 1][0] === c) {
      stack[stack.length - 1][1]++;
    } else {
      stack.push([c, 1]);
    }
    if (stack[stack.length - 1][1] === k) {
      stack.pop();
    }
  }
  return stack.map(([c, count]) => c.repeat(count)).join('');
}
