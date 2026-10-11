function addBinary(a: string, b: string): string {
  let res = "";
  let i = a.length - 1, j = b.length - 1;
  let carry = 0;
  while (i >= 0 || j >= 0 || carry > 0) {
    let sum = carry;
    if (i >= 0) sum += a.charCodeAt(i) - 48;
    if (j >= 0) sum += b.charCodeAt(j) - 48;
    res = (sum % 2) + res;
    carry = Math.floor(sum / 2);
    i--;
    j--;
  }
  return res;
}
