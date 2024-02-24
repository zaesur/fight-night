import { roundPercentages, sortResultsByOptionId } from "./utils.js";

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
   * @param { number } id
   * @param { str } name
   * @param { Option[] } options
   * @memberof Question
   */
  constructor(
    client,
    storage,
    id,
    name,
    options,
    activeOptions,
    { rawResults = [], isAnimated = false, show = false }
  ) {
    this.#client = client;
    this.#storage = storage;

    this.id = id;
    this.name = name;
    this.options = options;
    this.activeOptions = activeOptions;
    this.rawResults = rawResults;
    this.isAnimated = isAnimated;
    this.show = show;
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

  publish = async (optionId) => {
    if (!this.isClosed) {
      await this.close();
    }

    this.optionsShown = optionId
      ? [...(this.optionsShown ?? []), optionId]
      : this.options.map(({ optionId }) => optionId);
  };

  refresh = async () => {
    const response = await this.#client.getResults();
    this.processResults(response.result);
  };

  save = () => {
    this.#storage.setItem("active_question", this.id);
    this.#storage.setItem(`question_${this.id}`, JSON.stringify(this));
  };

  setVotes = (formData) => {
    for (const [optionId, votes] of [...formData.entries()]) {
      const option = this.findOptionById(parseInt(optionId));

      if (option) {
        option.votes = parseInt(votes);
      }
    }
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
    }

    this.rawResults = results;
  };

  calculatePercentages = () => {
    const total = this.options.reduce((acc, { votes }) => acc + votes, 0);
    const unrounded = this.options.map(({ votes }) => (votes / total) * 100);
    const rounded = roundPercentages(unrounded);

    for (const [index, option] of Object.entries(this.options)) {
      option.percentage = rounded[index];
    }
  };

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
    id: this.id,
    name: this.name,
    options: this.options,
    activeOptions: this.activeOptions,
    rawResults: this.rawResults,
    isAnimated: this.isAnimated,
    show: this.show,
  });
}
