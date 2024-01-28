import config from "../config.js";
import App from "./lib/app.js";
import Client, { ClientError } from "./lib/client.js";

const client = new Client(config.apiUrl);
const app = new App(client, window.localStorage);

const DO_NOTHING = undefined;
const errorElement = document.getElementById("error");
const resultsElement = document.getElementById("results");
const startHardwareButton = document.getElementById("start-hardware");
const stopHardwareButton = document.getElementById("stop-hardware");
const getResultsButton = document.getElementById("get-results");
const stopQuestionButton = document.getElementById("stop-question");
const publishQuestionButton = document.getElementById("publish-question");
const whiteButton = document.getElementById("set-white");
const blackButton = document.getElementById("set-black");
const countInput = document.getElementById("voter-count");

const handlePromise = (promise, onSuccess, onFail, onFinished) => {
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

// On start hardware input.
startHardwareButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  const count = countInput.value;
  handlePromise(app.startHardware(count), DO_NOTHING, DO_NOTHING, () => {
    event.target.disabled = false;
    countInput.focus();
  });
});

// On stop hardware input.
stopHardwareButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  handlePromise(app.stopHardware(), DO_NOTHING, DO_NOTHING, () => {
    event.target.disabled = false;
  });
});

// On get results input.
getResultsButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  handlePromise(
    app.getResults().then((results) => {
      for (const { optionId, votes } of results) {
        const input = resultsElement.querySelector(`input[name="${optionId}"]`);
        input.value = votes;
      }
    }),
    DO_NOTHING,
    DO_NOTHING,
    () => {
      event.target.disabled = false;
    }
  );
});

// On stop question input.
stopQuestionButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  handlePromise(app.stopQuestion(), DO_NOTHING, DO_NOTHING, () => {
    event.target.disabled = false;
  });
});

// On publish question input.
publishQuestionButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.target.disabled = true;

  const formData = new FormData(resultsElement);
  const results = Array.from(formData.entries()).map(([optionId, votes]) => {
    return { optionId: parseInt(optionId), votes: parseInt(votes) };
  });

  handlePromise(app.publishQuestion(results), DO_NOTHING, DO_NOTHING, () => {
    event.target.disabled = false;
  });
});

whiteButton.addEventListener("click", (event) => {
  event.preventDefault();
  app.setBackgroundColor("white");
});

blackButton.addEventListener("click", (event) => {
  event.preventDefault();
  app.setBackgroundColor("black");
});

const renderControl = () => {
  const questionsElement = document.getElementById("questions");
  const templateElement = document.querySelector("template").content;

  const nodes = config.questions.map(({ id, question, answers }) => {
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
      const options = Array.from(formData.entries()).map(
        ([optionId, optionName]) => ({
          optionId: parseInt(optionId),
          optionName,
        })
      );

      handlePromise(
        app.startQuestion(id, options),
        DO_NOTHING,
        DO_NOTHING,
        () => {
          event.target.disabled = false;
        }
      );
    });

    return clone;
  });

  questionsElement.replaceChildren(...nodes);
};

renderControl();
