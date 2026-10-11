function decodeString(s: string): string {
  const stack: [string, number][] = [];
  let curStr = "";
  let curNum = 0;
  for (const c of s) {
    if (c >= "0" && c <= "9") {
      curNum = curNum * 10 + Number(c);
    } else if (c === "[") {
      stack.push([curStr, curNum]);
      curStr = "";
      curNum = 0;
    } else if (c === "]") {
      const [prevStr, num] = stack.pop()!;
      curStr = prevStr + curStr.repeat(num);
    } else {
      curStr += c;
    }
  }
  return curStr;
}
