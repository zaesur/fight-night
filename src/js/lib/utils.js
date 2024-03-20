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

export const exportToCSV = () => {
  const questions = [];

  Object.values(localStorage).forEach((value) => {
    const { id, rawResults } = JSON.parse(value);

    if (id) {
      const answers = [];

      for (const {
        keypadId,
        options: [optionId],
      } of rawResults) {
        answers[parseInt(keypadId)] = optionId;
      }

      questions[id - 1] = answers;
    }
  });

  const csvContent = questions.map((e) => e.join(",")).join("\n");
  const csvFile = `data:text/csv;charset=utf-8,${csvContent}`;

  const link = document.createElement("a");
  link.href = encodeURI(csvFile);
  link.download = "Results.csv";
  link.click();
};
