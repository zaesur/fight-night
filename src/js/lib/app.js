import Question from "./question.js";
/**
 * @typedef {import("./serialize.js").Option} Option
 * @typedef {import("./serialize.js").Result} Result
 * @typedef {import("./client.js").Client} Client
 * @typedef {import("./client.js").QuestionResponse["result"][0]} HardwareResult
 */

export default class App {
  #client;
  #storage;

  /**
   * @type { Question }
   */
  activeQuestion;

  /**
   *
   * @type { Question[] }
   */
  questions;

  // Audience stuff.
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
    this.#loadQuestionsFromStorage();
  }

  getActiveQuestionName = () => this.activeQuestion?.questionName ?? "No question active";

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
    this.activeQuestion.processResults(response.result);
    this.#saveActiveQuestion();
    return this.activeQuestion.options;
  };

  /**
   *
   * @param { FormData } formData
   * @memberof App
   */
  startQuestion = async (formData) => {
    const question = Question.fromForm(formData);
    const count = question.getCount();
    await this.#client.startQuestion(count);

    // If the above throws, this would not reach the audience.
    this.isVisible = true;
    this.activeQuestion = question;
    this.questions.push(question);
    this.#saveActiveQuestion();
    this.#syncAudience();
  };

  stopQuestion = async () => {
    const response = await this.#client.stopQuestion();

    this.activeQuestion.processResults(response.result);
    this.#saveActiveQuestion();
  };

  /**
   *
   *
   * @param { FormData } formData
   * @memberof App
   */
  publishQuestion = async (formData) => {
    this.isVisible = true;

    for (const [optionId, votes] of formData.entries()) {
      this.activeQuestion.setVotes(parseInt(optionId), parseInt(votes));
    }
    this.#saveActiveQuestion();
    this.activeQuestion = undefined;
    this.#saveActiveQuestion();
    this.#syncAudience();
  };

  #loadQuestionsFromStorage = () => {
    const id = parseInt(this.#storage.getItem("active_question"));
    const questions = Object.entries(this.#storage)
      .filter(([storageKey]) => storageKey.startsWith("question"))
      .map(([_, value]) => Question.fromJSON(JSON.parse(value)));

    this.questions = questions;
    this.activeQuestion = this.questions.find(({ questionId }) => questionId === id);
  };

  #saveActiveQuestion = () => {
    if (this.activeQuestion) {
      this.#storage.setItem("active_question", this.activeQuestion.questionId);
      this.#storage.setItem(`question_${this.activeQuestion.questionId}`, JSON.stringify(this.activeQuestion));
    } else {
      this.#storage.removeItem("active_question");
    }
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
