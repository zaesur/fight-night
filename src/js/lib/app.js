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

  audienceState = "showBlank";
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
    this.audienceState = "showBlank";
    this.backgroundColor = color;
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
    this.audienceState = "showOptions";
    this.activeQuestion = this.#factory.fromForm(formData);
    this.questions.push(this.activeQuestion);
    await this.activeQuestion.start();
    this.activeQuestion.save();
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
    this.audienceState = "showResults";
    await this.activeQuestion.publishAll(formData);
    this.activeQuestion.save();
    this.#syncAudience();
  };

  publishQuestion = async (optionId, formData) => {
    this.audienceState = "showResults";
    await this.activeQuestion.publish(formData, optionId);
    this.activeQuestion.save();
    this.#syncAudience();
  };

  findQuestionById = (id) => {
    return this.questions.find(({ questionId }) => questionId === id);
  };

  createSummary = () => {
    const q1 = this.findQuestionById(1);
    const q2 = this.findQuestionById(2);
    const q3 = this.findQuestionById(3);
    const q4 = this.findQuestionById(4);
    const q8 = this.findQuestionById(8);
    const q10 = this.findQuestionById(10);
    const q18 = this.findQuestionById(18);

    const q18Voters = q18.findKeypadIdsByOptionIds([1, 2]);
    const q1Majority = q1.findMaxOptionByKeypadIds(q18Voters).optionId;
    const q2Majority = q2.findMaxOptionByKeypadIds(q18Voters).optionId;
    const q3Majority = q3.findMaxOptionByKeypadIds(q18Voters);
    const q4Majority = q4.findMaxOptionByKeypadIds(q18Voters);
    const q8Majority = q8.findMaxOptionByKeypadIds(q18Voters).optionId;
    const q10Majority = q10.findMaxOptionByKeypadIds(q18Voters).optionId;
    const q18Majority = q10.findMaxOptionByKeypadIds(q18Voters).optionId;

    const religion = q8Majority === 1 ? "A religious" : q8Majority === 2 ? "A spiritual" : "An atheist";
    const gender = q2Majority === 1 ? "woman" : q2Majority === 2 ? "man" : "person";
    const age = q3Majority.optionName;
    const salary = q4Majority.optionName;
    const pronoun = q2Majority === 1 ? "She is" : q2Majority === 2 ? "He is" : "They are";
    const bias =
      q10Majority === 1
        ? "a little bit racist"
        : q10Majority === 2
          ? "a little bit sexist"
          : q10Majority === 3
            ? "a little bit violent"
            : "neither racist, sexist nor violent";
    const ticket = q1Majority === 1 ? "paid" : "did not pay";
    const leave = q18Majority === 1 ? "leave" : "stay";

    return `
      ${religion} ${gender}, ${age} years old, who makes ${salary} a month.
      ${pronoun} ${bias}, ${ticket} for a ticket, and wanted the others to ${leave}.
    `;
  };

  publishSummary = () => {
    this.audienceState = "showSummary";
    this.summary = this.createSummary();
    this.#syncAudience();
  };

  publishVoterIds = () => {
    this.audienceState = "showVoterIds";
    this.voterIds = [1, 2, 3];
    this.#syncAudience();
  };

  #syncAudience = () => {
    this.#storage.setItem(
      "audience_state",
      JSON.stringify({
        state: this.audienceState,
        data: {
          backgroundColor: this.backgroundColor,

          options: this.activeQuestion.options,
          isAnimated: this.activeQuestion.isAnimated,
          optionsShown: this.activeQuestion.optionsShown,

          summary: this.summary,
          voterIds: this.voterIds,
        },
      })
    );
  };
}
