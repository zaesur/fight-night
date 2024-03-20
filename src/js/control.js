import config from "../config.js";
import App from "./lib/app.js";
import Client from "./lib/client.js";
import { exportToCSV } from "./lib/utils.js";

const language = new URLSearchParams(window.location.search).get("language") ?? "en";
const client = new Client(config.apiUrl);
const app = new App(client, window.localStorage);

const disable = (el) => (el.disabled = true);
const enable = (el) => (el.disabled = false);
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
    votesReceived: document.getElementById("votes-received"),
    stopQuestion: document.getElementById("stop-question"),
    publishQuestion: document.getElementById("publish-question"),
    cancelQuestion: document.getElementById("cancel-question"),
    export: document.getElementById("export"),

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
    },
  },

  appEventHandlers: {
    onHardwareStart(event) {
      Control.$.startHardware.disabled = true;
      Control.$.stopHardware.disabled = false;
      Control.$.keypadMin.disabled = true;
      Control.$.keypadMin.value = event.detail.minKeypadId;
      Control.$.keypadMax.disabled = true;
      Control.$.keypadMax.value = event.detail.maxKeypadId;
      Control.$.status.classList.add("active");
      Control.$.status.classList.remove("inactive");
    },

    onHardwareStop() {
      Control.$.startHardware.disabled = false;
      Control.$.stopHardware.disabled = true;
      Control.$.keypadMin.disabled = false;
      Control.$.keypadMax.disabled = false;
      Control.$.status.classList.add("inactive");
      Control.$.status.classList.remove("active");
    },

    onStartQuestion(event) {
      Control.$.cancelQuestion.disabled = false;
      Control.$.disableAllStartButtons();
      Control.$.stopQuestion.disabled = false;
      Control.$.resultsLabel.textContent = event.detail.name;
    },

    onPublishQuestion(event) {
      if (event.detail.isComplete) {
        Control.$.disableResults();
        Control.$.enableAllStartButtons();
      }
    },

    onStopQuestion() {
      Control.$.enableAllResultFields();
      Control.$.enableAllPublishButtons();
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

    onCancelQuestion() {
      app.setBackgroundColor("white");
      Control.$.stopQuestion.disabled = true;
      Control.$.enableAllStartButtons();
      Control.$.disableResults();
    },

    onPublishSummary(event) {
      event.target.disabled = true;
      app.publishSummary(language).catch(onEventError(event));
    },

    onPublishNovote(event) {
      event.target.disabled = true;
      app.publishVoterIds().then(onEventError(event));
    },

    onPublishReturnRemotes() {
      app.publishReturnRemotes(config.returnRemotes);
    },

    onShowWhiteBackground() {
      app.setBackgroundColor("white");
    },

    onShowBlackBackground() {
      app.setBackgroundColor("black");
    },

    onExport() {
      exportToCSV();
    },
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
  },
};

app.init();
Control.init();
