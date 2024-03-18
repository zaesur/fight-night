import QuestionFactory from "./questionFactory.js";
/**
 * @typedef {import("./client.js").Client} Client
 */

export default class App {
  #client;
  #storage;
  #factory;

  activeQuestion;
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

  getActiveQuestionName = () => this.activeQuestion?.name ?? "No question active";

  setBackgroundColor = (color) => {
    this.audienceState = "showBlank";
    this.backgroundColor = color;
    this.#syncAudience();
  };

  pollHardware = async () => {
    const response = await this.#client.getState();
    const isActive = Boolean(response.result["hardware_state"]);
    const activeVoters = isActive ? response.result["keypadIds"].length : undefined;

    this.isActive = isActive;
    this.activeVoters = activeVoters;

    return isActive;
  };

  startHardware = async (minKeypadId, maxKeypadId) => {
    await this.#client.startHardware(minKeypadId, maxKeypadId);
  };

  stopHardware = async () => {
    await this.#client.stopHardware();
    this.keypadIds = undefined;
  };

  getResults = async () => {
    await this.activeQuestion.refresh();
    const novotes = await this.getNoVotes(this.activeQuestion.id);
    return {
      results: this.activeQuestion.options,
      votesReceived: this.activeQuestion.votesReceived,
      votersActive: this.activeVoters,
      novotes,
    };
  };

  getActiveKeypadIds = async () => {
    const response = await this.#client.getState();
    this.keypadIds = response.result.keypadIds;
    return this.keypadIds;
  };

  /**
   * Starts a new question.
   * @param { FormData } formData a form containing the question data
   * @memberof App
   */
  startQuestion = async (formData) => {
    const question = this.#factory.fromForm(formData);
    await question.start();

    this.audienceState = "showOptions";
    this.activeQuestion = question;

    const index = this.questions.findIndex(({ id }) => question.id === id);
    if (index >= 0) {
      this.questions[index] = question;
    } else {
      this.questions.push(question);
    }

    this.activeQuestion.save();
    this.#syncAudience();
  };

  /**
   * Closes the active question.
   * @memberof App
   */
  stopQuestion = async () => {
    if (this.activeQuestion) {
      await this.activeQuestion.close();
      this.activeQuestion.save();
    } else {
      this.#client.stopQuestion();
    }
  };

  /**
   * Publish a question to the audience.
   * @param { FormData } formData a form containing possibly overridden votes
   * @memberof App
   */
  publishQuestion = async (formData, optionId) => {
    this.audienceState = "showResults";
    this.activeQuestion.setVotes(formData);
    this.activeQuestion.calculatePercentages();
    await this.activeQuestion.publish(optionId);
    this.activeQuestion.save();
    this.#syncAudience();
  };

  findQuestionById = (questionId) => {
    return this.questions.find(({ id }) => questionId === id);
  };

  createSummary = async (language) => {
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

    const q1 = this.findQuestionById(1);
    const q2 = this.findQuestionById(2);
    const q3 = this.findQuestionById(3);
    const q4 = this.findQuestionById(4);
    const q8 = this.findQuestionById(8);
    const q10 = this.findQuestionById(10);
    const q18 = this.findQuestionById(18);

    const activeKeypadIds = await this.getActiveKeypadIds();
    const backstageKeypadIds = q18?.filterKeypadIdsByVote([5]) ?? [];
    const majorityKeypadIds = activeKeypadIds.filter((id) => !backstageKeypadIds.includes(id));

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

    const formatNederlands = ({ q1, q2, q3, q4, q8, q10 }) => {
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
        ${religion} ${gender}, ${age} jaar oud, met een inkomen van ${salary} per maand.
        ${pronoun} is ${bias}, ${ticket} voor hun kaartje, en wilde dat de anderen weggingen.
      `;
    };

    const summary = (
      {
        "en": formatEnglish,
        "nl": formatNederlands,
      }[language] ?? formatEnglish
    )({ q1: q1Majority, q2: q2Majority, q3: q3Majority, q4: q4Majority, q8: q8Majority, q10: q10Majority });

    return summary;
  };

  publishSummary = async (language) => {
    this.audienceState = "showSummary";
    this.summary = await this.createSummary(language);
    this.#syncAudience();
  };

  getNoVotes = async (id) => {
    const question = this.findQuestionById(id);
    const keypadIds = question?.rawResults?.map(({ keypadId }) => keypadId) ?? [];
    const activeKeypadIds = this.keypadIds ?? (await this.getActiveKeypadIds());
    const noVote = activeKeypadIds.filter((keypadId) => !keypadIds.includes(keypadId));

    return noVote;
  };

  publishVoterIds = async () => {
    this.audienceState = "showVoterIds";

    const nonVoters = await this.getNoVotes(18);

    this.voterIds = nonVoters;
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
        },
      })
    );
  };
}
