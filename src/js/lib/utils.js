export const roundPercentages = (percentagesToRound) => {
  const cumulativeSum = (sum) => (n) => (sum += n);
  const cumSum = percentagesToRound.map(cumulativeSum(0));
  const cumSumRounded = cumSum.map(Math.round);
  const roundedPercentages = cumSumRounded.map((x, i) => (i === 0 ? x : x - cumSumRounded[i - 1]));

  return roundedPercentages;
};

export const sortResultsByOptionId = (results) => {
  return results.reduce((acc, { keypadId, options: [optionId] }) => {
    if (acc?.[optionId]) {
      acc[optionId].push(keypadId);
    } else {
      acc[optionId] = [keypadId];
    }

    return acc;
  }, {});
};
