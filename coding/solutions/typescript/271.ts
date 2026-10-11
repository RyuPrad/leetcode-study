class Codec {
  encode(strs: string[]): string {
    let encoded = "";
    for (const str of strs) {
      encoded += str.length + "#" + str;
    }
    return encoded;
  }

  decode(s: string): string[] {
    const decoded: string[] = [];
    let i = 0;
    while (i < s.length) {
      let j = i;
      while (s[j] !== "#") j++;
      const len = Number(s.slice(i, j));
      const start = j + 1;
      decoded.push(s.slice(start, start + len));
      i = start + len;
    }
    return decoded;
  }
}
