export const roundPercentages = (percentagesToRound) => {
  percentagesToRound.forEach((perc, i) => {
    if(perc > 0 && perc < 1) {
      var toSub = 1 - perc;
      var maxInd = percentagesToRound.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      percentagesToRound[i] = 1;
      percentagesToRound[maxInd] = percentagesToRound[maxInd] - toSub;
    }         
  });
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

export const getLanguage = () => new URLSearchParams(window.location.search).get("language") ?? "en";
