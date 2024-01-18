export const getStatistics = (votes: Array<Vote>): StatisticRecord => {
  // First, sort all votes into buckets (no vote => -1)
  const buckets = votes.reduce<BucketRecord>(
    (acc, { keypadId, options: [vote = -1] }) => {
      if (acc?.[vote]) {
        acc[vote].push(keypadId);
      } else {
        acc[vote] = [keypadId];
      }

      return acc;
    },
    {}
  );

  // Second, calculate the share of the total vote count
  const statistics = Object.entries(buckets).reduce<StatisticRecord>(
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

export const calcRadius = (
  radius: number,
  reference: number,
  value: number
): number => Math.sqrt(value / reference) * radius;
