/**
 * @typedef {{ optionName: str, optionId: number, options: Option }} QuestionJSON
 * @typedef {import("./client.js").QuestionResponse["result"][0]} HardwareResult
 * @typedef {{ optionId: number, optionName: str keypadIds: number[], votes: number }} Option
 */

export default class Question {
  /**
   * Creates an instance of Question.
   * @param { str | number } questionId
   * @param { str } questionName
   * @param { Option[] } options
   * @memberof Question
   */
  constructor(questionId, questionName, options) {
    this.questionName = questionName;
    this.questionId = typeof questionId === "number" ? questionId : parseInt(questionId);
    this.options = options
      .filter(({ optionName }) => Boolean(optionName))
      .map(({ optionId, ...other }) => ({ optionId: parseInt(optionId), ...other }));
  }

  /**
   * Finds the option by optionId.
   * @param { number } optionId
   * @returns { Option | undefined }
   * @memberof Question
   */
  findOption = (optionId) => this.options.find((option) => option.optionId === optionId);

  /**
   * Returns the number of keypads to activate.
   * @returns { number }
   * @memberof Question
   */
  getCount = () => this.options.reduce((max, { optionId }) => Math.max(max, optionId), 0);

  /**
   * Process incoming results from the hardware.
   * @param { HardwareResult[] } results
   * @memberof Question
   */
  processResults = (results) => {
    // Gather the results by optionId in a dictionary.
    const buckets = results.reduce((acc, { keypadId, options: [optionId] }) => {
      if (acc?.[optionId]) {
        acc[optionId].push(keypadId);
      } else {
        acc[optionId] = [keypadId];
      }

      return acc;
    }, {});

    // Save the results.
    for (const option of this.options) {
      const keypadIds = buckets[option.optionId] ?? [];
      option.keypadIds = keypadIds;
      option.votes = keypadIds.length;
    }
  };

  /**
   * Set the votes for an option.
   * This is to facilitate forging votes, the original votes will be kept in keypadIds.
   * @param { number } optionId
   * @param { number } votes
   * @memberof Question
   */
  setVotes = (optionId, votes) => {
    const option = this.findOption(optionId);
    if (option) {
      option.votes = votes;
    }
  };

  /**
   * Used for serialization.
   * Automatically invoked by JSON.stringify.
   * @example JSON.stringify(new Question(...))
   * @return { QuestionJSON }
   * @memberof Question
   */
  toJSON = () => ({
    questionId: this.questionId,
    questionName: this.questionName,
    options: this.options,
  });

  /**
   * Used for deserialization.
   * @static
   * @param { QuestionJSON } json
   * @memberof Question
   */
  static fromJSON = ({ questionId, questionName, options }) => {
    return new Question(questionId, questionName, options);
  };

  /**
   * Used to create a Question based on form data.
   * @static
   * @param { FormData } formData
   * @memberof Question
   */
  static fromForm = (formData) => {
    return new Question(
      ...Array.from(formData.entries()).reduce(
        ([questionId, questionName, options], [key, value]) =>
          key === "questionId"
            ? [parseInt(value), questionName, options]
            : key === "questionName"
              ? [questionId, value, options]
              : [questionId, questionName, [...options, { optionId: parseInt(key), optionName: value }]],
        [undefined, undefined, []]
      )
    );
  };
}
