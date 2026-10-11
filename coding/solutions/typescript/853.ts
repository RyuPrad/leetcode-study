function carFleet(target: number, position: number[], speed: number[]): number {
  const cars = position.map((p, i) => [p, speed[i]]);
  cars.sort((a, b) => b[0] - a[0]);
  const stack: number[] = [];
  for (const [p, s] of cars) {
    const time = (target - p) / s;
    stack.push(time);
    if (stack.length >= 2 && stack[stack.length - 1] <= stack[stack.length - 2]) {
      stack.pop();
    }
  }
  return stack.length;
}
