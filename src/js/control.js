import config from "../config.js";
import App from "./lib/app.js";
import Client, { ClientError } from "./lib/client.js";
import { roundPercentages, exportToCSV } from "./lib/utils.js";

let interval;
const intervalTimeout = config.pollInterval;

const client = new Client(config.apiUrl);
const app = new App(client, window.localStorage);

const statusElement = document.getElementById("status");
const errorElement = document.getElementById("error");
const resultsElement = document.getElementById("results");
const inputs = resultsElement.querySelectorAll("input");
const resultsLabelElement = document.getElementById("results-label");
const votesReceivedElement = document.getElementById("votes-received");
const votesMissingElement = document.getElementById("votes-missing");
const novotesElement = document.getElementById("novote");
const startHardwareButton = document.getElementById("start-hardware");
const stopHardwareButton = document.getElementById("stop-hardware");
const stopQuestionButton = document.getElementById("stop-question");
const publishQuestionButton = document.getElementById("publish-question");
const summarizeButton = document.getElementById("summarize");
const novoteButton = document.getElementById("show-novote");
const whiteButton = document.getElementById("set-white");
const blackButton = document.getElementById("set-black");
const exportButton = document.getElementById("export");
const keypadMinField = document.getElementById("min-keypad-id");
const keypadMaxField = document.getElementById("max-keypad-id");

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

const pollHardware = () => {
  statusElement.classList.remove("active", "inactive");

  app
    .pollHardware()
    .then((hardwareActive) => {
      if (hardwareActive) {
        statusElement.classList.add("active");
        startHardwareButton.disabled = true;
        stopHardwareButton.disabled = false;
        keypadMinField.disabled = true;
        keypadMaxField.disabled = true;
      } else {
        statusElement.classList.add("inactive");
        startHardwareButton.disabled = false;
        stopHardwareButton.disabled = true;
        keypadMinField.disabled = false;
        keypadMaxField.disabled = false;
      }
    })
    .catch(() => {
      startHardwareButton.disabled = true;
      stopHardwareButton.disabled = true;
      keypadMinField.disabled = false;
      keypadMaxField.disabled = false;
    })
    .finally(() => {
      window.setTimeout(pollHardware, intervalTimeout);
    });
};

resultsElement.addEventListener("input", () => {
  const formData = new FormData(resultsElement);
  const values = Array.from(formData.values()).map(Number);
  const canPublish = values.some(Boolean);

  const total = values.reduce((r, n) => r + n, 0);
  const dataset = values.map((value) => (value / total) * 100 || 0);
  const percentages = roundPercentages(dataset);

  for (const [index, percentage] of percentages.entries()) {
    inputs[index].parentElement.childNodes[4].textContent = `${percentage}%`;
  }

  publishQuestionButton.disabled = !canPublish;
});

// Fires the event to calculate percentages on first load.
resultsElement.dispatchEvent(new Event("input"));

// On start hardware input.
startHardwareButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  app
    .startHardware(parseInt(keypadMinField.value), parseInt(keypadMaxField.value))
    .then(pollHardware)
    .then(resetError)
    .catch(showError);
});

// On stop hardware input.
stopHardwareButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  app.stopHardware().then(pollHardware).then(resetError).catch(showError);
});

// On stop question input.
stopQuestionButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  app
    .stopQuestion()
    .then(() => {
      resetError();
      window.clearTimeout(interval);
    })
    .catch((error) => {
      event.target.disabled = false;
      showError(error);
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
      window.clearTimeout(interval);
      resultsLabelElement.textContent = app.getActiveQuestionName();
      resultsElement.querySelectorAll("input").forEach((input) => (input.value = "0"));
      votesReceivedElement.textContent = "0";
    })
    .catch(showError)
    .finally(() => {
      event.target.disabled = false;
      resultsElement.dispatchEvent(new Event("input"));
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
    window.clearTimeout(interval);

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

exportButton.addEventListener("click", (event) => {
  event.preventDefault();
  exportToCSV();
});

const questionsElement = document.getElementById("questions");
const templateElement = document.querySelector("template").content;

resultsLabelElement.textContent = app.getActiveQuestionName();

const nodes = config.questions.map(
  ({ id, question, options, activeOptions, isAnimated, showQuestion, showOnlyOptionId }) => {
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
      formData.append("showOnlyOptionId", showOnlyOptionId);

      app
        .startQuestion(formData)
        .then(() => {
          stopQuestionButton.disabled = false;
          resultsLabelElement.textContent = app.getActiveQuestionName();

          const refresh = () => {
            app
              .getResults()
              .then(({ results, votesReceived, votersActive, novotes }) => {
                votesReceivedElement.textContent = `${votesReceived}/${votersActive} (${Math.round((votesReceived / votersActive) * 100)}%)`;
                votesMissingElement.textContent = novotes?.length ?? 0;
                novotesElement.value = novotes.join(", ");

                for (const { optionId, votes } of results) {
                  const input = resultsElement.querySelector(`input[name="${optionId}"]`);
                  input.value = votes;
                  resultsElement.dispatchEvent(new Event("input"));
                }
              })
              .finally(() => {
                interval = window.setTimeout(refresh, intervalTimeout);
              });
          };

          refresh();
        })
        .catch(showError)
        .finally(() => {
          event.target.disabled = false;
        });
    });

    return clone;
  }
);

questionsElement.replaceChildren(...nodes);
pollHardware();
