export const roundPercentages = (percentagesToRound) => {
  const cumulativeSum = (sum) => (n) => (sum += n);
  const cumSum = percentagesToRound.map(cumulativeSum(0));
  const cumSumRounded = cumSum.map(Math.round);
  const roundedPercentages = cumSumRounded.map((x, i) => (i === 0 ? x : x - cumSumRounded[i - 1]));

  return roundedPercentages;
};
