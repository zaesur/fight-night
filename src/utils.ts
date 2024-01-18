type BucketRecord = Record<number, Array<number>>;
type StatisticRecord = Record<
  number,
  { keypadIds: Array<number>; count: number; percentage: number }
>;

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
    (acc, [vote, keypadIds]) => ({
      ...acc,
      [vote]: {
        keypadIds,
        count: keypadIds.length,
        percentage: (keypadIds.length / votes.length) * 100,
      },
    }),
    {}
  );

  return statistics;
};
