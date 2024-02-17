import Question from "./question.js";

export default class QuestionFactory {
  #client;
  #storage;

  constructor(client, storage) {
    this.#client = client;
    this.#storage = storage;
  }

  loadAll = () => {
    const questions = Object.entries(this.#storage)
      .filter(([storageKey]) => storageKey.startsWith("question"))
      .map(([_, value]) => this.fromJSON(JSON.parse(value)));

    const activeQuestionId = parseInt(this.#storage.getItem("active_question"));
    const activeQuestion = questions.find(({ questionId }) => questionId === activeQuestionId);

    return [activeQuestion, questions];
  };

  /**
   * Used for deserialization.
   * @static
   * @param { Client } client
   * @param { QuestionJSON } json
   * @memberof Question
   */
  fromJSON = ({ questionId, questionName, options, activeOptions }) => {
    return new Question(this.#client, this.#storage, questionId, questionName, options, activeOptions);
  };

  /**
   * Used to create a Question based on form data.
   * @static
   * @param { Client } client
   * @param { FormData } formData
   * @memberof Question
   */
  fromForm = (formData) => {
    const questionId = parseInt(formData.get("questionId"));
    const questionName = formData.get("questionName");
    const activeOptions = parseInt(formData.get("activeOptions"));
    const options = formData
      .getAll("option")
      .map((optionName, index) => ({ optionId: index + 1, optionName }))
      .filter(({ optionName }) => Boolean(optionName));

    return new Question(this.#client, this.#storage, questionId, questionName, options, activeOptions);
  };
}
