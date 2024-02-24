import Question from "./question.js";

export default class QuestionFactory {
  #client;
  #storage;

  constructor(client, storage) {
    this.#client = client;
    this.#storage = storage;
  }

  /**
   * Load active question and questions from storage.
   * @returns { [Question | undefined, Questions[]]}
   * @memberof QuestionFactory
   */
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
  fromJSON = ({ questionId, questionName, options, activeOptions, rawResults, isAnimated }) => {
    return new Question(
      this.#client,
      this.#storage,
      questionId,
      questionName,
      options,
      activeOptions,
      rawResults,
      isAnimated
    );
  };

  /**
   * Used to create a Question based on form data.
   * @static
   * @param { Client } client
   * @param { FormData } formData
   * @memberof Question
   */
  fromForm = (formData) => {
    const id = parseInt(formData.get("id"));
    const question = formData.get("question");
    const activeOptions = parseInt(formData.get("activeOptions"));
    const isAnimated = Boolean(formData.get("isAnimated"));

    const options = formData
      .getAll("option")
      .map((optionName, index) => ({ optionId: index + 1, optionName }))
      .filter(({ optionName }) => Boolean(optionName));

    return new Question(this.#client, this.#storage, id, question, options, activeOptions, isAnimated);
  };
}
