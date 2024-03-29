import config from "../config.js";
import App from "./lib/app.js";
import Client from "./lib/client.js";
import { exportToCSV, getLanguage } from "./lib/utils.js";

const language = getLanguage();
const client = new Client(config.apiUrl);
const app = new App(client, window.localStorage);

const disable = (el) => (el.disabled = true);
const enable = (el) => (el.disabled = false);
const disableTemporarily = (el, ms) => {
  el.disabled = true;
  new Promise((r) => setTimeout(r, ms)).finally(() => (el.disabled = false));
};
const onEventError = (event) => (error) => {
  event.target.disabled = false;
  throw error;
};

const Control = {
  $: {
    questions: document.getElementById("questions"),
    questionTemplate: document.getElementById("question-template"),
    inputTemplate: document.getElementById("input-template"),

    /* Stopping/starting the hardware. */
    status: document.getElementById("status"),
    startHardware: document.getElementById("start-hardware"),
    stopHardware: document.getElementById("stop-hardware"),
    keypadMin: document.getElementById("min-keypad-id"),
    keypadMax: document.getElementById("max-keypad-id"),

    error: document.getElementById("error"),
    results: document.getElementById("results"),
    inputs: document.querySelectorAll("#results input"),
    resultsLabel: document.getElementById("results-label"),
    votesTotal: document.getElementById("votes-total"),
    stopQuestion: document.getElementById("stop-question"),
    publishQuestion: document.getElementById("publish-question"),
    cancelQuestion: document.getElementById("cancel-question"),
    export: document.getElementById("export"),
    novote: document.getElementById("novote"),
    summary: document.getElementById("summary"),

    /* Different screens. */
    showWhiteBackground: document.getElementById("set-white"),
    showBlackBackground: document.getElementById("set-black"),
    showSummary: document.getElementById("show-summary"),
    showNovote: document.getElementById("show-novote"),
    showReturnRemotes: document.getElementById("show-return-remotes"),

    /* Get */
    getKeypadMin: () => parseInt(Control.$.keypadMin.value),
    getKeypadMax: () => parseInt(Control.$.keypadMax.value),
    getStartButtons: () => document.querySelectorAll("[data-id='button']"),
    getPublishButtons: () => document.querySelectorAll("[data-id='publish']"),
    getPercentageField: (id) => document.querySelector(`[data-id='percentage'][data-option-id='${id}']`),
    getPercentageFields: () => document.querySelectorAll(`[data-id='percentage']`),
    getResultField: (id) => document.querySelector(`[data-id='votes'][data-option-id='${id}']`),
    getResultFields: () => document.querySelectorAll("[data-id='votes']"),
    getQuestion: (id) => document.querySelector(`[data-question-id='${id}']`),
    getOptions: (id) => Control.$.getQuestion(id).querySelectorAll("[data-option-id]"),

    getQuestionData(id) {
      const question = config.questions.find((q) => q.id === parseInt(id));

      return {
        ...question,
        name: question.question,
        options: Object.entries(question.options).map(([optionId, optionName]) => ({
          optionId: parseInt(optionId),
          optionName,
        })),
      };
    },

    setResults(options) {
      for (const option of options) {
        const input = Control.$.getResultField(option.optionId);
        const percentage = Control.$.getPercentageField(option.optionId);
        input.value = option.votes;
        percentage.textContent = `${option.percentage}%`;
      }
    },

    setTotal(votesMissing, votesTotal) {
      const votesReceived = votesTotal - votesMissing;
      const percentage = Math.round((votesReceived / votesTotal) * 100);
      Control.$.votesTotal.textContent = `${votesReceived}/${votesTotal} (${percentage}%)`;
    },

    setNoVote(votesMissing) {
      Control.$.novote.textContent = votesMissing.join(", ");
    },

    setSummary(summary) {
      Control.$.summary.textContent = summary;
    },

    setPublishTitles(title) {
      Control.$.getPublishButtons().forEach((button) => (button.title = title));
    },

    /* Toggles */
    enableAllStartButtons: () => Control.$.getStartButtons().forEach(enable),
    disableAllStartButtons: () => Control.$.getStartButtons().forEach(disable),
    enableAllPublishButtons: () => Control.$.getPublishButtons().forEach(enable),
    disableAllPublishButtons: () => Control.$.getPublishButtons().forEach(disable),
    enableAllResultFields: () => Control.$.getResultFields().forEach(enable),
    disableAllResultFields: () => Control.$.getResultFields().forEach(disable),

    disableResults() {
      Control.$.cancelQuestion.disabled = true;
      Control.$.stopQuestion.disabled = true;
      Control.$.disableAllPublishButtons();
      Control.$.disableAllResultFields();
      Control.$.getResultFields().forEach((field) => (field.value = 0));
      Control.$.getPercentageFields().forEach((field) => (field.textContent = ""));
      Control.$.resultsLabel.textContent = "No question active";
      // Control.$.novote.textContent = "";
      Control.$.votesTotal.textContent = "";
    },
  },

  appEventHandlers: {
    onInit(event) {
      const state = event.detail.state;

      if (state.hardwareIsActive) {
        const minKeypadId = state.keypadIds.at(0);
        const maxKeypadId = state.keypadIds.at(-1);
        Control.appEventHandlers.onHardwareStart({ detail: { minKeypadId, maxKeypadId } });
      } else {
        Control.appEventHandlers.onHardwareStop();
      }

      if (state.questionIsActive) {
        Control.listeners.startCheckResults();
        Control.$.stopQuestion.disabled = false;
        Control.$.cancelQuestion.disabled = false;
        Control.$.disableAllStartButtons();
      }
    },

    onHardwareStart(event) {
      Control.$.startHardware.disabled = true;
      Control.$.stopHardware.disabled = false;
      Control.$.keypadMin.disabled = true;
      Control.$.keypadMin.value = event.detail.minKeypadId;
      Control.$.keypadMax.disabled = true;
      Control.$.keypadMax.value = event.detail.maxKeypadId;
      Control.$.status.classList.add("active");
      Control.$.status.classList.remove("inactive");
      Control.$.enableAllStartButtons();
    },

    onHardwareStop() {
      Control.$.startHardware.disabled = false;
      Control.$.stopHardware.disabled = true;
      Control.$.keypadMin.disabled = false;
      Control.$.keypadMax.disabled = false;
      Control.$.status.classList.add("inactive");
      Control.$.status.classList.remove("active");
      Control.$.disableAllStartButtons();
    },

    onStartQuestion(event) {
      Control.$.cancelQuestion.disabled = false;
      Control.listeners.startCheckResults();
      Control.$.disableAllStartButtons();
      Control.$.stopQuestion.disabled = false;
      Control.$.resultsLabel.textContent = event.detail.name;
    },

    onPublishQuestion(event) {
      Control.$.disableAllResultFields();

      if (event.detail.isComplete) {
        Control.$.disableResults();
        Control.$.enableAllStartButtons();
      }
    },

    onStopQuestion(event) {
      Control.$.enableAllResultFields();
      Control.$.enableAllPublishButtons(event.detail.id);
      Control.$.setResults(event.detail.options);
      Control.checkResultsValidity(event.detail.options, app.activeQuestion.id);
      Control.$.setTotal(event.detail.missingKeypadIds.length, event.detail.keypadIds.length);

      // For Q18.
      Control.$.setNoVote(event.detail.missingKeypadIds);
      Control.$.setSummary(event.detail.summary);
    },
  },

  buttonEventHandlers: {
    onHardwareStart(event) {
      event.target.disabled = true;
      const keypadMin = Control.$.getKeypadMin();
      const keypadMax = Control.$.getKeypadMax();
      app.startHardware(keypadMin, keypadMax).catch(onEventError(event));
    },

    onHardwareStop(event) {
      event.target.disabled = true;
      app.stopHardware().catch(onEventError(event));
    },

    onStopQuestion(event) {
      event.target.disabled = true;
      Control.listeners.stopCheckResults?.();
      app.stopQuestion().catch(onEventError(event));
    },

    onPublishQuestion(event) {
      event.target.disabled = true;
      const optionId = parseInt(event.target.dataset.optionId);
      app.publishQuestion(optionId).catch(onEventError(event));
    },

    onStartQuestion(event) {
      event.target.disabled = true;
      const id = event.target.dataset.questionId;
      const data = Control.$.getQuestionData(id);
      app.startQuestion(data).catch(onEventError(event));
    },

    onCancelQuestion(event) {
      event.target.disabled = true;
      app.cancelQuestion();
      app.setBackgroundColor("white");
      Control.$.stopQuestion.disabled = true;
      Control.$.disableResults();
      Control.listeners?.stopCheckResults();
      Control.$.enableAllStartButtons();
    },

    onPublishSummary(event) {
      disableTemporarily(event.target, 300);
      app.publishSummary();
    },

    onPublishNovote(event) {
      disableTemporarily(event.target, 300);
      app.publishVoterIds();
    },

    onPublishReturnRemotes(event) {
      disableTemporarily(event.target, 300);
      app.publishReturnRemotes(config.returnRemotes);
    },

    onShowWhiteBackground(event) {
      disableTemporarily(event.target, 300);
      app.setBackgroundColor("white");
    },

    onShowBlackBackground(event) {
      disableTemporarily(event.target, 300);
      app.setBackgroundColor("black");
    },

    onExport(event) {
      disableTemporarily(event.target, 300);
      exportToCSV();
    },
  },

  inputEventHandlers: {
    onResultFieldChange: (event) => {
      const optionId = parseInt(event.target.dataset.optionId);
      const votes = parseInt(event.target.value);

      const newResults = app.setResults(optionId, votes);
      Control.$.setResults(newResults);
      Control.checkResultsValidity(newResults, app.activeQuestion.id);
    },
  },

  listeners: {
    startCheckResults: () => {
      let pointer;
      const controller = new AbortController();
      const signal = controller.signal;

      app
        .getResults(signal)
        .then(({ options, missingKeypadIds, keypadIds }) => {
          Control.$.setResults(options);
          Control.$.setTotal(missingKeypadIds.length, keypadIds.length);
          Control.$.setNoVote(missingKeypadIds);
        })
        .catch((error) => {
          if (typeof error === DOMException && error.name === "AbortError") {
            // If it is the aborted promise don't do anything.
            return;
          }

          throw error;
        })
        .finally(() => {
          pointer = window.setTimeout(Control.listeners.startCheckResults, config.pollInterval);
        });

      Control.listeners.stopCheckResults = () => {
        controller.abort();
        window.clearTimeout(pointer);
      };
    },
  },

  checkResultsValidity(options, id) {
    const isPeopleQuestion = [5, 6, 14].includes(id);
    const isEmpty = options.every((option) => option.votes === 0);
    const angeloIsNotLast = id === 14 && options.some((option) => option.percentage < options.at(-1).percentage);
    const leaveIsNotWinning = id === 18 && options[0].percentage < options[1].percentage;

    const allPercentages = options.map((option) => option.percentage);
    const zeroPercentages = allPercentages.filter((p) => p === 0);
    const nonZeroPercentages = allPercentages.filter((p) => p !== 0);
    const isNotUnique = new Set(nonZeroPercentages).size + zeroPercentages.length !== options.length;

    if (isEmpty || isNotUnique || angeloIsNotLast || leaveIsNotWinning) {
      Control.$.disableAllPublishButtons();

      if (isEmpty) {
        Control.$.setPublishTitles("All options have 0 votes.");
      } else if (isNotUnique) {
        Control.$.setPublishTitles("Some result percentages are not unique.");
      } else if (angeloIsNotLast) {
        Control.$.setPublishTitles("Angelo is not last.");
      } else if (leaveIsNotWinning) {
        Control.$.setPublishTitles("Leave is not winning.");
      }
    } else {
      Control.$.setPublishTitles("Publish");
      Control.$.enableAllPublishButtons();
      Control.$.publishQuestion.disabled = isPeopleQuestion;
    }
  },

  renderQuestion({ id, question, options }) {
    const clone = document.importNode(Control.$.questionTemplate.content, true);
    const div = clone.firstElementChild;

    div.dataset.id = id;

    const legend = clone.querySelector("legend");
    const field = clone.querySelector("fieldset");
    const startButton = clone.querySelector("button");

    legend.textContent = `${id}: ${question}`;
    startButton.dataset.questionId = id;
    startButton.addEventListener("click", Control.buttonEventHandlers.onStartQuestion);

    const createOption = (optionId, defaultValue) => {
      const clone = document.importNode(Control.$.inputTemplate, true).content;
      const label = clone.querySelector("[data-id='label']");
      const input = clone.querySelector("[data-id='input']");

      label.textContent = optionId;
      input.value = defaultValue;
      input.addEventListener("input", (event) => {
        options[optionId] = event.target.value;
      });

      return clone;
    };

    for (const [optionId, defaultValue] of Object.entries(options)) {
      const option = createOption(optionId, defaultValue);
      field.insertBefore(option, startButton);
    }

    Control.$.questions.appendChild(clone);
  },

  render() {
    for (const question of config.questions) {
      Control.renderQuestion(question);
    }
  },

  bindAppEvents() {
    app.addEventListener(app.INIT, Control.appEventHandlers.onInit);
    app.addEventListener(app.START_HARDWARE, Control.appEventHandlers.onHardwareStart);
    app.addEventListener(app.STOP_HARDWARE, Control.appEventHandlers.onHardwareStop);
    app.addEventListener(app.START_QUESTION, Control.appEventHandlers.onStartQuestion);
    app.addEventListener(app.STOP_QUESTION, Control.appEventHandlers.onStopQuestion);
    app.addEventListener(app.PUBLISH_QUESTION, Control.appEventHandlers.onPublishQuestion);
  },

  bindButtonEvents() {
    Control.$.export.addEventListener("click", Control.buttonEventHandlers.onExport);
    Control.$.startHardware.addEventListener("click", Control.buttonEventHandlers.onHardwareStart);
    Control.$.stopHardware.addEventListener("click", Control.buttonEventHandlers.onHardwareStop);
    Control.$.stopQuestion.addEventListener("click", Control.buttonEventHandlers.onStopQuestion);
    Control.$.cancelQuestion.addEventListener("click", Control.buttonEventHandlers.onCancelQuestion);
    Control.$.publishQuestion.addEventListener("click", Control.buttonEventHandlers.onPublishQuestion);
    Control.$.showNovote.addEventListener("click", Control.buttonEventHandlers.onPublishNovote);
    Control.$.showSummary.addEventListener("click", Control.buttonEventHandlers.onPublishSummary);
    Control.$.showReturnRemotes.addEventListener("click", Control.buttonEventHandlers.onPublishReturnRemotes);
    Control.$.showWhiteBackground.addEventListener("click", Control.buttonEventHandlers.onShowWhiteBackground);
    Control.$.showBlackBackground.addEventListener("click", Control.buttonEventHandlers.onShowBlackBackground);

    for (const button of Control.$.getPublishButtons()) {
      button.addEventListener("click", Control.buttonEventHandlers.onPublishQuestion);
    }
  },

  bindInputEvents() {
    for (const field of Control.$.getResultFields()) {
      field.addEventListener("input", Control.inputEventHandlers.onResultFieldChange);
    }
  },

  translateConfig(language) {
    const translate = (obj, property) => {
      if (typeof obj[property] === "object") {
        obj[property] = obj[property][language];
      }
    };

    translate(config, "returnRemotes");

    for (const question of config.questions) {
      translate(question, "question");
      for (const optionId of Object.keys(question.options)) {
        translate(question.options, optionId);
      }
    }
  },

  init() {
    Control.translateConfig(language);
    Control.render();
    Control.bindAppEvents();
    Control.bindButtonEvents();
    Control.bindInputEvents();
  },
};

app.init();
Control.init();
