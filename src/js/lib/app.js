import config from "../../config.js";
import QuestionFactory from "./questionFactory.js";
/**
 * @typedef {import("./client.js").Client} Client
 */

export default class App extends EventTarget {
  /* Private variables */
  #client;
  #storage;
  #factory;

  /* Event names */
  INIT = "init";
  START_HARDWARE = "start-hardware";
  STOP_HARDWARE = "stop-hardware";
  START_QUESTION = "start-question";
  STOP_QUESTION = "stop-question";
  PUBLISH_QUESTION = "publish-question";
  GET_RESULTS = "get-results";

  /* State */
  activeQuestion;
  questions = Array(config.questions.length);
  audienceState = "showBlank";
  backgroundColor = "white";

  /**
   * Creates an instance of App.
   * @param { Client } client
   * @param { Storage } storage
   * @memberof App
   */
  constructor(client, storage) {
    super();
    this.#client = client;
    this.#storage = storage;
    this.#factory = new QuestionFactory(client, storage);
    [this.activeQuestion, this.questions] = this.#factory.loadAll();
  }

  /**
   * Initializes the system by polling the hardware.
   * @memberof App
   */
  init = async () => {
    const state = await this.getState();

    this.#dispatchInitEvent(state);
  };

  /**
   * Dispatch init event.
   * @param {*} state
   * @memberof App
   */
  #dispatchInitEvent = (state) => {
    this.dispatchEvent(new CustomEvent(this.INIT, { detail: { state } }));
  };

  /**
   * Dispatch start hardware event.
   * @param {number} minKeypadId
   * @param {number} maxKeypadId
   * @memberof App
   */
  #dispatchStartHardware = (minKeypadId, maxKeypadId) => {
    if (!minKeypadId || !maxKeypadId) {
      throw "Must provide min and max keypad Id!";
    }

    this.dispatchEvent(new CustomEvent(this.START_HARDWARE, { detail: { minKeypadId, maxKeypadId } }));
  };

  /**
   * Dispatch stop hardware event.
   */
  #dispatchStopHardware = () => {
    this.dispatchEvent(new CustomEvent(this.STOP_HARDWARE));
  };

  /**
   * Dispatch start question event.
   * @param {string} name
   * @memberof App
   */
  #dispatchStartQuestion = (name) => {
    if (name === undefined) {
      throw "Must provide name!";
    }

    this.dispatchEvent(new CustomEvent(this.START_QUESTION, { detail: { name } }));
  };

  /**
   * Dispatch publish question event.
   * @param {boolean} isComplete
   */
  #dispatchPublishQuestion = (isComplete) => {
    if (isComplete === undefined) {
      throw "Must provide isComplete!";
    }

    this.dispatchEvent(new CustomEvent(this.PUBLISH_QUESTION, { detail: { isComplete } }));
  };

  /**
   * Dispatch stop question event.
   */
  #dispatchStopQuestion = (id, options, missingKeypadIds, keypadIds) => {
    if (options === undefined) {
      throw "Must provide options!";
    }

    this.dispatchEvent(
      new CustomEvent(this.STOP_QUESTION, {
        detail: { id, options, missingKeypadIds, keypadIds },
      })
    );
  };

  getQuestionById = (questionId) => {
    return this.questions[questionId];
  };

  setActiveQuestion = (question) => {
    this.activeQuestion = question;
    this.questions[question.id] = question;
  };

  /**
   * Gets the current hardware state
   * @returns { { hardwareIsActive: boolean, questionIsActive: boolean, keypadIds: Array<number> }}
   * @memberof App
   */
  getState = async () => {
    const response = await this.#client.getState();
    this.keypadIds = response.result.keypadIds;

    return {
      hardwareIsActive: Boolean(response.result.hardware_state),
      questionIsActive: Boolean(response.result.active_question),
      keypadIds: response.result.keypadIds,
    };
  };

  setBackgroundColor = (color) => {
    this.audienceState = "showBlank";
    this.backgroundColor = color;
    this.#syncAudience();
  };

  /**
   * Starts the hardware.
   * @param {number} minKeypadId
   * @param {number} maxKeypadId
   * @memberof App
   */
  startHardware = async (minKeypadId, maxKeypadId) => {
    await this.#client.startHardware(minKeypadId, maxKeypadId);
    await this.getState();
    this.#dispatchStartHardware(minKeypadId, maxKeypadId);
  };

  /**
   * Stops the hardware.
   * @memberof App
   */
  stopHardware = async () => {
    await this.#client.stopHardware();
    this.keypadIds = undefined;
    this.#dispatchStopHardware();
  };

  getResults = async (signal) => {
    await this.activeQuestion.refresh(signal);

    return { options: this.activeQuestion.options, missingKeypadIds: this.getNoVotes(), keypadIds: this.keypadIds };
  };

  setResults = (optionId, votes) => {
    return this.activeQuestion.setVotes(optionId, votes);
  };

  /**
   * Starts a new question.
   * @param { any } questionData
   * @memberof App
   */
  startQuestion = async (questionData) => {
    const question = this.#factory.fromJSON(questionData);
    await question.start();

    this.audienceState = "showOptions";

    this.setActiveQuestion(question);
    this.#syncAudience();

    this.#dispatchStartQuestion(this.activeQuestion.name);
  };

  /**
   * Closes the active question.
   * @memberof App
   */
  stopQuestion = async () => {
    await this.activeQuestion.close();
    this.#dispatchStopQuestion(this.activeQuestion.id, this.activeQuestion.options, this.getNoVotes(), this.keypadIds);
  };

  /**
   * Publish a question to the audience.
   * @param { FormData } formData a form containing possibly overridden votes
   * @memberof App
   */
  publishQuestion = async (optionId) => {
    this.audienceState = "showResults";
    await this.activeQuestion.publish(optionId);
    this.#syncAudience();

    this.#dispatchPublishQuestion(this.activeQuestion.optionsShown.length === this.activeQuestion.options.length);
  };

  createSummary = (language) => {
    const getMiddle = (str) => {
      const match = str.match(/(\d+)[-—](\d+)/);
      if (match) {
        const [, start, end] = match;
        const middle = Math.floor((parseInt(start) + parseInt(end)) / 2);

        return String(middle);
      } else {
        return str;
      }
    };

    const q1 = this.getQuestionById(1);
    const q2 = this.getQuestionById(2);
    const q3 = this.getQuestionById(3);
    const q4 = this.getQuestionById(4);
    const q8 = this.getQuestionById(8);
    const q10 = this.getQuestionById(10);
    const q18 = this.getQuestionById(18);

    const backstageKeypadIds = q18?.filterKeypadIdsByVote([5]) ?? [];
    const majorityKeypadIds = this.keypadIds.filter((id) => !backstageKeypadIds.includes(id));

    const q1Majority = q1?.findMaxOptionByKeypadIds(majorityKeypadIds) ?? { optionId: 1 }; // Default: paid
    const q2Majority = q2?.findMaxOptionByKeypadIds(majorityKeypadIds) ?? { optionId: 1 }; // Default: woman
    const q3Majority = q3?.findMaxOptionByKeypadIds(majorityKeypadIds) ?? { optionName: "25-44" };
    const q4Majority = q4?.findMaxOptionByKeypadIds(majorityKeypadIds) ?? { optionName: "2500-4000" };
    const q8Majority = q8?.findMaxOptionByKeypadIds(majorityKeypadIds) ?? { optionId: 3 }; // Default: atheist
    const q10Majority = q10?.findMaxOptionByKeypadIds(majorityKeypadIds) ?? { optionId: 4 }; // Default: no bias

    const formatEnglish = ({ q1, q2, q3, q4, q8, q10 }) => {
      const religion = q8.optionId === 1 ? "A religious" : q8.optionId === 2 ? "A spiritual" : "An atheist";
      const gender = q2.optionId === 1 ? "woman" : q2.optionId === 2 ? "man" : "person";
      const age = getMiddle(q3.optionName);
      const salary = getMiddle(q4.optionName);
      const pronoun = q2.optionId === 1 ? "She is" : q2.optionId === 2 ? "He is" : "They are";
      const bias =
        q10.optionId === 1
          ? "a little bit racist"
          : q10.optionId === 2
            ? "a little bit sexist"
            : q10.optionId === 3
              ? "a little bit violent"
              : "neither racist, sexist nor violent";
      const ticket = q1.optionId === 1 ? "paid" : "did not pay";

      return `
        The majority is
        ${religion} ${gender}, ${age} years old, who makes ${salary} a month.
        ${pronoun} ${bias}, ${ticket} for a ticket, and wanted the others to leave.
      `;
    };

    const formatDutch = ({ q1, q2, q3, q4, q8, q10 }) => {
      const religion = q8.optionId === 1 ? "religieuze" : q8.optionId === 2 ? "spirituele" : "atheistische";
      const gender = q2.optionId === 1 ? "vrouw" : q2.optionId === 2 ? "man" : "persoon";
      const age = getMiddle(q3.optionName);
      const salary = getMiddle(q4.optionName);
      const pronoun = q2.optionId === 1 ? "Zij" : q2.optionId === 2 ? "Hij" : "Hen";
      const bias =
        q10.optionId === 1
          ? "een beetje racistisch"
          : q10.optionId === 2
            ? "een beetje seksistisch"
            : q10.optionId === 3
              ? "een beetje geweldadig"
              : "noch racistisch, seksistisch of geweldadig";
      const ticket = q1.optionId === 1 ? "betaalde wel" : "betaalde niet";

      return `
        De meerderheid is een
        ${religion} ${gender}, ${age} jaar oud en verdient ${salary} per maand.
        ${pronoun} is ${bias}, ${ticket} voor een kaartje, en wilde dat de anderen weggingen.
      `;
    };

    const summary = (
      {
        "en": formatEnglish,
        "nl": formatDutch,
      }[language] ?? formatEnglish
    )({ q1: q1Majority, q2: q2Majority, q3: q3Majority, q4: q4Majority, q8: q8Majority, q10: q10Majority });

    return summary;
  };

  publishSummary = (language) => {
    this.audienceState = "showSummary";
    this.summary = this.createSummary(language);
    this.#syncAudience();
  };

  getNoVotes = (id) => {
    const question = this.getQuestionById(id ?? this.activeQuestion.id);
    const keypadIds = question?.rawResults?.map(({ keypadId }) => keypadId) ?? [];
    const activeKeypadIds = this.keypadIds;
    const noVote = activeKeypadIds.filter((keypadId) => !keypadIds.includes(keypadId));

    return noVote;
  };

  publishVoterIds = async () => {
    this.audienceState = "showVoterIds";

    const nonVoters = await this.getNoVotes(18);

    this.voterIds = nonVoters;
    this.#syncAudience();
  };

  publishReturnRemotes = (returnRemotes) => {
    this.audienceState = "showReturnRemotes";
    this.returnRemotes = returnRemotes;

    this.#syncAudience();
  };

  #syncAudience = () => {
    this.#storage.setItem(
      "audience_state",
      JSON.stringify({
        state: this.audienceState,
        data: {
          backgroundColor: this.backgroundColor,

          /* Question related data */
          question: this.activeQuestion?.name,
          options: this.activeQuestion?.options,
          optionsShown: this.activeQuestion?.optionsShown,
          optionsAnimated: this.activeQuestion?.optionsAnimated,
          showQuestion: this.activeQuestion?.showQuestion,
          showOnlyOptionId: this.activeQuestion?.showOnlyOptionId,

          /* Etc related data */
          summary: this.summary,
          voterIds: this.voterIds,
          returnRemotes: this.returnRemotes,
        },
      })
    );
  };
}
