import config from "../../config.js";
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
      .map(([_, value]) => JSON.parse(value))
      .reduce(
        (all, question) => ({
          ...all,
          [question.id]: question,
        }),
        Array(config.questions.length)
      );

    const activeQuestionId = parseInt(this.#storage.getItem("active_question"));
    const activeQuestion = questions[activeQuestionId];

    return [activeQuestion, questions];
  };

  /**
   * Used for deserialization.
   * @static
   * @param { Client } client
   * @param { QuestionJSON } json
   * @memberof Question
   */
  fromJSON = ({ id, name, options, activeOptions, rawResults, isAnimated, showQuestion, showOnlyOptionId }) => {
    return new Question(this.#client, this.#storage, id, name, options, activeOptions, {
      rawResults,
      isAnimated,
      showQuestion,
      showOnlyOptionId,
    });
  };
}
