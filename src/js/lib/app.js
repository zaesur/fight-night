import { mergeResults } from "./utils.js";

/**
 * @typedef {import("./serialize.js").Option} Option
 * @typedef {import("./serialize.js").Result} Result
 * @typedef {import("./client.js").Client} Client
 * @typedef {import("./client.js").QuestionResponse["result"][0]} HardwareResult
 */

export default class App {
  #client;
  #storage;

  questionId = 0;
  isVisible = false;
  backgroundColor = "white";
  options = [];
  results = [];

  /**
   * Creates an instance of App.
   * @param { Client } client
   * @param { Storage } storage
   * @memberof App
   */
  constructor(client, storage) {
    this.#client = client;
    this.#storage = storage;
  }

  setBackgroundColor = (color) => {
    this.backgroundColor = color;
    this.isVisible = false;
    this.#syncAudience();
  };

  startHardware = async (number) => {
    await this.#client.startHardware(0, number);
  };

  stopHardware = async () => {
    await this.#client.stopHardware();
  };

  getResults = async () => {
    const response = await this.#client.getResults();
    return mergeResults(response.result);
  };

  startQuestion = async (questionId, options) => {
    // Find the *highest* optionId to request that number of votes.
    const filtered = options.filter(({ optionName }) => Boolean(optionName));
    const max = filtered.reduce(
      (max, { optionId }) => Math.max(max, optionId),
      0
    );
    await this.#client.startQuestion(max);

    // This will not be reached if the above throws,
    // so it won't end up at the audience.
    this.questionId = questionId;
    this.options = filtered;
    this.results = [];
    this.isVisible = true;
    this.#syncAudience();
  };

  stopQuestion = async () => {
    const response = await this.#client.stopQuestion();
    this.results = mergeResults(response.result);
    this.#syncDatabase();
  };

  publishQuestion = async (results) => {
    this.isVisible = true;

    for (const { optionId, votes } of results) {
      const match = this.results.find((result) => result.optionId === optionId);
      if (match) {
        match.votes = votes;
      }
    }

    this.#syncAudience();
  };

  #syncDatabase = () => {
    this.#storage.setItem(
      `question_${this.questionId}`,
      JSON.stringify(this.results)
    );
  };

  #syncAudience = () => {
    this.#storage.setItem(
      "audience_state",
      JSON.stringify({
        isVisible: this.isVisible,
        backgroundColor: this.backgroundColor,
        options: this.options,
        results: this.results,
      })
    );
  };
}
