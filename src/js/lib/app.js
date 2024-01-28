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

  systemIsActive = false;
  questionIsActive = false;

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
    return mergeResults(response.result, this.options);
  };

  startQuestion = async (options) => {
    const max = options.reduce(
      (max, { optionId }) => Math.max(max, optionId),
      0
    );
    await this.#client.startQuestion(max);

    // This will not be reached if the above throws,
    // so it won't end up at the audience.
    this.options = options;
    this.isVisible = true;
    this.#syncAudience();
  };

  stopQuestion = async () => {
    const response = await this.#client.stopQuestion();
    return mergeResults(response.result, this.options);
  };

  // TODO: allow input to override.
  publishQuestion = async () => {
    await this.stopQuestion();

    // This will not be reached if the above throws,
    // so it won't end up at the audience.
    this.isVisible = true;
    this.#syncAudience();
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
