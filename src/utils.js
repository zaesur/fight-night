export const getStatistics = (votes) => {
  // First, sort all votes into buckets (no vote => -1)
  const buckets = votes.reduce((acc, { keypadId, options: [vote = -1] }) => {
    if (acc?.[vote]) {
      acc[vote].push(keypadId);
    } else {
      acc[vote] = [keypadId];
    }

    return acc;
  }, {});

  // Second, calculate the share of the total vote count
  const statistics = Object.entries(buckets).reduce(
    (acc, [vote, keypadIds]) => {
      acc[vote] = {
        keypadIds,
        count: keypadIds.length,
        percentage: (keypadIds.length / votes.length) * 100,
      };
      return acc;
    },
    {}
  );

  return statistics;
};

export const calcRadius = (radius, reference, value) =>
  Math.sqrt(value / reference) * radius;
