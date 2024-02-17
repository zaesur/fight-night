import Question from "./question.js";
/**
 * @typedef {import("./client.js").Client} Client
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
  isClosed = true;

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
    this.#loadQuestionsFromStorage();
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

  getResults = async () => {
    const response = await this.#client.getResults();
    this.activeQuestion.processResults(response.result);
    this.#saveActiveQuestion();
    return this.activeQuestion.options;
  };

  /**
   * Starts a new question, based on a form with the option names to use.
   * @param { FormData } formData a form containing the question data
   * @memberof App
   */
  startQuestion = async (formData) => {
    const question = Question.fromForm(formData);
    const count = question.getCount();
    await this.#client.startQuestion(count);

    this.isClosed = false;
    this.isVisible = true;
    this.isAnswered = false;
    this.backgroundColor = "white";
    this.activeQuestion = question;
    this.questions.push(question);
    this.#saveActiveQuestion();
    this.#syncAudience();
  };

  /**
   * Closes a question.
   * @memberof App
   */
  stopQuestion = async () => {
    await this.#client.stopQuestion();
    this.isClosed = true;
  };

  /**
   * Publish a question to the audience.
   * Publishing a question does *NOT* query the hardware,
   * instead it expects a form with the overridden votes.
   * @param { FormData } formData a form containing possibly overridden votes
   * @memberof App
   */
  publishQuestion = async (formData) => {
    if (!this.isClosed) {
      await this.stopQuestion().catch();
    }

    const formVotes = Array.from(formData.entries()).map((vote) => vote.map((n) => (n ? parseInt(n) : 0)));
    this.activeQuestion.setVotes(formVotes);
    this.#saveActiveQuestion();

    this.isVisible = true;
    this.isAnswered = true;
    this.#syncAudience();
    this.#clearActiveQuestion();
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

  #clearActiveQuestion = () => {
    this.activeQuestion = undefined;
    this.#saveActiveQuestion();
  };

  #syncAudience = () => {
    this.#storage.setItem(
      "audience_state",
      JSON.stringify({
        isVisible: this.isVisible,
        isAnswered: this.isAnswered,
        backgroundColor: this.backgroundColor,
        options: this.activeQuestion?.options ?? [],
      })
    );
  };
}
