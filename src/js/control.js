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
const novoteButton = document.getElementById("show-novote");
const whiteButton = document.getElementById("set-white");
const blackButton = document.getElementById("set-black");

const resetError = () => {
  errorElement.textContent = "";
};

const showError = (error) => {
  if (error instanceof ClientError) {
    const message = `${error.message}: ${error.reason}`;
    errorElement.textContent = message;
  } else {
    throw error;
  }
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

  app
    .startHardware(
      parseInt(document.getElementById("min-keypad-id").value),
      parseInt(document.getElementById("max-keypad-id").value) + 1
    )
    .then(resetError)
    .catch(showError)
    .finally(() => {
      event.target.disabled = false;
    });
});

// On stop hardware input.
stopHardwareButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  app
    .stopHardware()
    .then(resetError)
    .catch(showError)
    .finally(() => {
      event.target.disabled = false;
    });
});

// On stop question input.
stopQuestionButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  app
    .stopQuestion()
    .then(() => {
      resetError();
      window.clearInterval(interval);
    })
    .catch(showError)
    .finally(() => {
      event.target.disabled = false;
    });
});

// On publish question input.
publishQuestionButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  const formData = new FormData(resultsElement);

  app
    .publishQuestion(formData)
    .then(() => {
      resetError();
      window.clearInterval(interval);
      resultsLabelElement.textContent = app.getActiveQuestionName();
      resultsElement.querySelectorAll("input").forEach((input) => (input.value = "0"));
      resultsElement.dispatchEvent(new Event("input"));
    })
    .catch(showError)
    .finally(() => {
      event.target.disabled = false;
    });
});

summarizeButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  app
    .publishSummary()
    .then(resetError)
    .catch(showError)
    .finally(() => {
      event.target.disabled = false;
    });
});

novoteButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  app
    .publishVoterIds()
    .then(resetError)
    .catch(showError)
    .finally(() => {
      event.target.disabled = false;
    });
});

const publishButtons = document.querySelectorAll("[data-option-id]");
for (const button of publishButtons) {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.target.disabled = true;
    window.clearInterval(interval);

    const optionId = parseInt(button.dataset.optionId);
    const formData = new FormData(resultsElement);

    app
      .publishQuestion(formData, optionId)
      .then(resetError)
      .catch(showError)
      .finally(() => {
        event.target.disabled = false;
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

const nodes = config.questions.map(({ id, question, options, activeOptions, isAnimated, showQuestion }) => {
  const clone = document.importNode(templateElement, true);
  const form = clone.querySelector("form");
  const legend = clone.querySelector("legend");
  const inputs = clone.querySelectorAll("input");
  const button = clone.querySelector("button");

  legend.textContent = `${id}: ${question}`;
  for (const input of inputs) {
    const optionId = input.dataset.optionId;
    const option = options[optionId];

    if (option) {
      input.value = option;
    } else {
      input.parentElement.style.display = "none";
    }
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.target.disabled = true;

    const formData = new FormData(form);
    formData.append("question", question);
    formData.append("id", id);
    formData.append("activeOptions", activeOptions);
    formData.append("isAnimated", isAnimated);
    formData.append("showQuestion", showQuestion);

    app
      .startQuestion(formData)
      .then(() => {
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
      })
      .catch(showError)
      .finally(() => {
        event.target.disabled = false;
      });
  });

  return clone;
});

questionsElement.replaceChildren(...nodes);
