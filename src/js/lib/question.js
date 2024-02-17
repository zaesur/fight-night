/**
 * @typedef {import("./client.js").Client} Client
 * @typedef {{ optionName: str, optionId: number, options: Option }} QuestionJSON
 * @typedef {import("./client.js").QuestionResponse["result"][0]} HardwareResult
 * @typedef {{ optionId: number, optionName: str keypadIds: number[], votes: number }} Option
 */

export default class Question {
  #client;
  #storage;

  isClosed = true;
  isAnswered = false;

  /**
   * Creates an instance of Question.
   * @param { Client } client
   * @param { number } questionId
   * @param { str } questionName
   * @param { Option[] } options
   * @memberof Question
   */
  constructor(client, storage, questionId, questionName, options, activeOptions, rawResults) {
    this.#client = client;
    this.#storage = storage;

    this.questionId = questionId;
    this.questionName = questionName;
    this.options = options;
    this.activeOptions = activeOptions;
    this.rawResults = rawResults;
  }

  start = async () => {
    await this.#client.startQuestion(this.activeOptions);
    this.isClosed = false;
  };

  close = async () => {
    const response = await this.#client.stopQuestion();
    this.processResults(response.result);
    this.isClosed = true;
  };

  publish = async (optionId, formData) => {
    this.isAnswered = true;
    if (!this.isClosed) {
      await this.close();
    }

    for (const option of this.options) {
      option.show = option.optionId === optionId;
    }
  };

  publishAll = async (formData) => {
    this.isAnswered = true;
    if (!this.isClosed) {
      await this.close();
    }

    for (const option of this.options) {
      option.show = true;
    }
  };

  refresh = async () => {
    const response = await this.#client.getResults();
    this.processResults(response.result);
  };

  save = () => {
    this.#storage.setItem("active_question", this.questionId);
    this.#storage.setItem(`question_${this.questionId}`, JSON.stringify(this));
  };

  sortResultsByOptionId = (results) => {
    return results.reduce((acc, { keypadId, options: [optionId] }) => {
      if (acc?.[optionId]) {
        acc[optionId].push(keypadId);
      } else {
        acc[optionId] = [keypadId];
      }

      return acc;
    }, {});
  };

  /**
   * Process incoming results from the hardware.
   * @param { HardwareResult[] } results
   * @memberof Question
   */
  processResults = (results) => {
    // Gather the results by optionId in a dictionary.
    const buckets = this.sortResultsByOptionId(results);

    // Save the results.
    for (const option of this.options) {
      const keypadIds = buckets[option.optionId] ?? [];
      option.keypadIds = keypadIds;
      option.votes = keypadIds.length;
      option.percentage = (keypadIds.length / results.length) * 100;
    }

    this.rawResults = results;
  };

  findOptionById = (id) => this.options.find(({ optionId }) => optionId === id);

  findKeypadIdsByOptionIds = (optionIds) => {
    return this.rawResults
      .filter(({ options: [optionId] }) => optionIds.includes(optionId))
      .map(({ keypadId }) => keypadId);
  };

  findMaxOptionByKeypadIds = (keypadIds) => {
    const filtered = this.rawResults.filter(({ keypadId }) => keypadIds.includes(keypadId));
    const sorted = this.sortResultsByOptionId(filtered);
    const [max] = Object.entries(sorted).reduce(([max, votes], [optionId, keypadIds]) =>
      keypadIds.length > max ? [parseInt(optionId), keypadIds] : [max, votes]
    );
    const option = this.findOptionById(max);

    return option;
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
    activeOptions: this.activeOptions,
    rawResults: this.rawResults,
  });
}
