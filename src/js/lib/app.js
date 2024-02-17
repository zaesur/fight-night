import Question from "./question.js";
import QuestionFactory from "./questionFactory.js";
/**
 * @typedef {import("./client.js").Client} Client
 */

export default class App {
  #client;
  #storage;
  #factory;

  /**
   * @type { Question }
   */
  activeQuestion;

  /**
   *
   * @type { Question[] }
   */
  questions;

  isVisible = false;
  isAnswered = false;
  backgroundColor = "white";

  /**
   * Creates an instance of App.
   * @param { Client } client
   * @param { Storage } storage
   * @memberof App
   */
  constructor(client, storage) {
    this.#client = client;
    this.#storage = storage;
    this.#factory = new QuestionFactory(client, storage);
    [this.activeQuestion, this.questions] = this.#factory.loadAll();
  }

  getActiveQuestionName = () => this.activeQuestion?.questionName ?? "No question active";

  setBackgroundColor = (color) => {
    this.backgroundColor = color;
    this.isVisible = false;
    this.#syncAudience();
  };

  startHardware = async (number) => {
    await this.#client.startHardware(1, parseInt(number) + 1);
  };

  stopHardware = async () => {
    await this.#client.stopHardware();
  };

  /**
   * Refreshes the voting results of the active question.
   * @return {*}
   */
  getResults = async () => {
    await this.activeQuestion.refresh();
    return this.activeQuestion.options;
  };

  /**
   * Starts a new question.
   * @param { FormData } formData a form containing the question data
   * @memberof App
   */
  startQuestion = async (formData) => {
    // Create the question.
    this.activeQuestion = this.#factory.fromForm(formData);
    this.questions.push(this.activeQuestion);

    // Start the question.
    await this.activeQuestion.start();
    this.activeQuestion.save();

    // Send to the audience.
    this.backgroundColor = "white";
    this.isVisible = true;
    this.#syncAudience();
  };

  /**
   * Closes the active question.
   * @memberof App
   */
  stopQuestion = async () => {
    await this.activeQuestion.close();
    this.activeQuestion.save();
  };

  /**
   * Publish a question to the audience.
   * @param { FormData } formData a form containing possibly overridden votes
   * @memberof App
   */
  publishAllQuestion = async (formData) => {
    this.activeQuestion.publishAll(formData);
    this.isVisible = true;
    this.#syncAudience();
  };

  publishQuestion = async (optionId, formData) => {
    this.activeQuestion.publish(optionId, formData);
    this.isVisible = true;
    this.#syncAudience();
  };

  #syncAudience = () => {
    this.#storage.setItem(
      "audience_state",
      JSON.stringify({
        isVisible: this.isVisible,
        isAnswered: this.activeQuestion?.isAnswered ?? false,
        backgroundColor: this.backgroundColor,
        options: this.activeQuestion?.options ?? [],
      })
    );
  };
}
