import config from "../config.js";
import App from "./lib/app.js";
import Client, { ClientError } from "./lib/client.js";
import { roundPercentages } from "./lib/utils.js";

let interval;
const intervalTimeout = 5000;

const client = new Client(config.apiUrl);
const app = new App(client, window.localStorage);

const errorElement = document.getElementById("error");
const resultsElement = document.getElementById("results");
const inputs = resultsElement.querySelectorAll("input");
const resultsLabelElement = document.getElementById("results-label");
const startHardwareButton = document.getElementById("start-hardware");
const stopHardwareButton = document.getElementById("stop-hardware");
const stopQuestionButton = document.getElementById("stop-question");
const publishQuestionButton = document.getElementById("publish-question");
const summarizeButton = document.getElementById("summarize");
const whiteButton = document.getElementById("set-white");
const blackButton = document.getElementById("set-black");
const countInput = document.getElementById("voter-count");

const handlePromise = (promise, { onSuccess, onFail, onFinished }) => {
  promise
    .then((...args) => {
      errorElement.textContent = "";
      onSuccess?.(...args);
    })
    .catch((error) => {
      if (error instanceof ClientError) {
        const message = `${error.message}: ${error.reason}`;
        errorElement.textContent = message;
      } else {
        throw error;
      }

      onFail?.();
    })
    .finally(() => {
      onFinished?.();
    });
};

resultsElement.addEventListener("input", () => {
  const formData = new FormData(resultsElement);
  const values = Array.from(formData.values()).map(Number);

  const total = values.reduce((r, n) => r + n, 0);
  const dataset = values.map((value) => (value / total) * 100 || 0);
  const percentages = roundPercentages(dataset);

  for (const [index, percentage] of percentages.entries()) {
    inputs[index].parentElement.childNodes[4].textContent = `${percentage}%`;
  }
});

// Fires the event to calculate percentages on first load.
resultsElement.dispatchEvent(new Event("input"));

// On start hardware input.
startHardwareButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  const count = countInput.value;
  handlePromise(app.startHardware(count), {
    onFinished: () => {
      event.target.disabled = false;
      countInput.focus();
    },
  });
});

// On stop hardware input.
stopHardwareButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  handlePromise(app.stopHardware(), {
    onFinished: () => {
      event.target.disabled = false;
    },
  });
});

// On stop question input.
stopQuestionButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  handlePromise(app.stopQuestion(), {
    onSuccess: () => {
      window.clearInterval(interval);
    },
    onFinished: () => {
      event.target.disabled = false;
    },
  });
});

// On publish question input.
publishQuestionButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  const formData = new FormData(resultsElement);

  handlePromise(app.publishAllQuestion(formData), {
    onSuccess: () => {
      window.clearInterval(interval);
      resultsLabelElement.textContent = app.getActiveQuestionName();
      resultsElement.querySelectorAll("input").forEach((input) => (input.value = "0"));
      resultsElement.dispatchEvent(new Event("input"));
    },
    onFinished: () => {
      event.target.disabled = false;
    },
  });
});

summarizeButton.addEventListener("click", (event) => {
  event.preventDefault();
  app.publishSummary();
});

const publishButtons = document.querySelectorAll("[data-option-id]");
for (const button of publishButtons) {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.target.disabled = true;

    const optionId = parseInt(button.dataset.optionId);
    const formData = new FormData(resultsElement);

    handlePromise(app.publishQuestion(optionId, formData), {
      onFinished: () => {
        event.target.disabled = false;
      },
    });
  });
}

whiteButton.addEventListener("click", (event) => {
  event.preventDefault();
  app.setBackgroundColor("white");
});

blackButton.addEventListener("click", (event) => {
  event.preventDefault();
  app.setBackgroundColor("black");
});

const questionsElement = document.getElementById("questions");
const templateElement = document.querySelector("template").content;

resultsLabelElement.textContent = app.getActiveQuestionName();

const nodes = config.questions.map(({ id, question, answers, activeOptions }) => {
  const clone = document.importNode(templateElement, true);
  const form = clone.querySelector("form");
  const legend = clone.querySelector("legend");
  const inputs = clone.querySelectorAll("input");
  const button = clone.querySelector("button");

  legend.textContent = `${id}: ${question}`;
  for (const [i, answer] of answers.entries()) {
    const input = inputs[i];
    if (answer) {
      input.value = answer;
    }
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.target.disabled = true;

    const formData = new FormData(form);
    formData.append("questionName", question);
    formData.append("questionId", id);
    formData.append("activeOptions", activeOptions);

    handlePromise(app.startQuestion(formData), {
      onSuccess: () => {
        resultsLabelElement.textContent = app.getActiveQuestionName();

        const refresh = () => {
          app.getResults().then((results) => {
            for (const { optionId, votes } of results) {
              const input = resultsElement.querySelector(`input[name="${optionId}"]`);
              input.value = votes;
              resultsElement.dispatchEvent(new Event("input"));
            }
          });
        };

        refresh();
        interval = window.setInterval(refresh, intervalTimeout);
      },
      onFinished: () => {
        event.target.disabled = false;
      },
    });
  });

  return clone;
});

questionsElement.replaceChildren(...nodes);
