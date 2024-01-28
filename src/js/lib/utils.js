/**
 * @typedef {import("./client.js").QuestionResponse["result"][0]} HardwareResult
 * @typedef {import("./serialize.js").Option} Option
 * @typedef {import("./serialize.js").Result} Result
 */

/**
 * A helper function to parse hardware results data.
 * @param { HardwareResult[] } hardwareResults The results coming from the hardware.
 * @returns { Result[] } A more convenient ordering of results.
 */
export const mergeResults = (hardwareResults) => {
  // First, sort all votes into buckets (no vote => -1)
  const bucketsByOptionId = hardwareResults.reduce(
    (acc, { keypadId, options: [optionId = -1] }) => {
      if (acc?.[optionId]) {
        acc[optionId].push(keypadId);
      } else {
        acc[optionId] = [keypadId];
      }

      return acc;
    },
    {}
  );

  // Second, calculate the share of the total vote count
  const results = Object.entries(bucketsByOptionId).map(
    ([optionId, keypadIds]) => ({
      optionId,
      keypadIds,
      votes: keypadIds.length,
    })
  );

  return results;
};

export const calcRadius = (radius, reference, value) =>
  Math.sqrt(value / reference) * radius;
