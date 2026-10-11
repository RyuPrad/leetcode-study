function convertToTitle(columnNumber: number): string {
  let res = "";
  while (columnNumber > 0) {
    columnNumber--;
    const rem = columnNumber % 26;
    res = String.fromCharCode(65 + rem) + res;
    columnNumber = Math.floor(columnNumber / 26);
  }
  return res;
}
