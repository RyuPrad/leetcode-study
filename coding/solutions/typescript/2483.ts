function bestClosingTime(customers: string): number {
  let penalty = 0, best = 0, bestHour = 0;
  for (let i = 0; i < customers.length; i++) {
    penalty += customers[i] === 'Y' ? -1 : 1;
    if (penalty < best) {
      best = penalty;
      bestHour = i + 1;
    }
  }
  return bestHour;
}
