import { sortResultsByOptionId } from "./utils.js";

/**
 * @typedef {import("./client.js").Client} Client
 * @typedef {{ optionName: str, optionId: number, options: Option }} QuestionJSON
 * @typedef {import("./client.js").QuestionResponse["result"][0]} HardwareResult
 * @typedef {{ optionId: number, optionName: str keypadIds: number[], votes: number }} Option
 */

export default class Question {
  #client;
  #storage;

  rawResults = [];
  isClosed = true;

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

    this.isAnimated = [5, 6, 14, 15, 16, 17].includes(questionId);
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

  publish = async (formData, optionId) => {
    if (!this.isClosed) {
      await this.close();
    }

    this.optionsShown = [optionId];
  };

  publishAll = async (formData) => {
    if (!this.isClosed) {
      await this.close();
    }

    this.optionsShown = this.options.map(({ optionId }) => optionId);
  };

  refresh = async () => {
    const response = await this.#client.getResults();
    this.processResults(response.result);
  };

  save = () => {
    this.#storage.setItem("active_question", this.questionId);
    this.#storage.setItem(`question_${this.questionId}`, JSON.stringify(this));
  };

  /**
   * Process incoming results from the hardware.
   * @param { HardwareResult[] } results
   * @memberof Question
   */
  processResults = (results) => {
    // Gather the results by optionId in a dictionary.
    const buckets = sortResultsByOptionId(results);

    // Save the results.
    for (const option of this.options) {
      const keypadIds = buckets[option.optionId] ?? [];
      option.keypadIds = keypadIds;
      option.votes = keypadIds.length;
      option.percentage = (keypadIds.length / results.length) * 100;
    }

    this.rawResults = results;
  };

  processForm = (formData) => {};

  /**
   * Retrieves an option by its ID.
   * @param { number } id
   * @returns { Option | undefined }
   * @memberof Question
   */
  findOptionById = (id) => this.options.find(({ optionId }) => optionId === id);

  /**
   * Filters all the raw results to retrieve keypadIds who voted for
   * options included in optionIds.
   * @param { number[] } optionIds
   * @returns { number[] } A list of keypad IDs or undefined
   * @memberof Question
   */
  filterKeypadIdsByVote = (optionIds) => {
    return this.rawResults
      .filter(({ options: [optionId] }) => optionIds.includes(optionId))
      .map(({ keypadId }) => keypadId);
  };

  /**
   * Finds the majority option based on a subset of keypad IDs.
   * @param { number[] } keypadIds
   * @returns { Option | undefined }
   * @memberof Question
   */
  findMaxOptionByKeypadIds = (keypadIds) => {
    const filtered = this.rawResults.filter(({ keypadId }) => keypadIds.includes(keypadId));
    const sorted = sortResultsByOptionId(filtered);
    const [max] = Object.entries(sorted).reduce(
      ([max, votes], [optionId, keypadIds]) =>
        keypadIds.length > votes ? [parseInt(optionId), keypadIds.length] : [max, votes],
      [-1, 0]
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
