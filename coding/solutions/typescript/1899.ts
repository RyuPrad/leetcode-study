function mergeTriplets(triplets: number[][], target: number[]): boolean {
  let a = false, b = false, c = false;
  for (const [x, y, z] of triplets) {
    if (x <= target[0] && y <= target[1] && z <= target[2]) {
      if (x === target[0]) a = true;
      if (y === target[1]) b = true;
      if (z === target[2]) c = true;
    }
  }
  return a && b && c;
}
