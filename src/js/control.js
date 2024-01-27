import config from "../config.js";

const whiteButton = document.getElementById("white");
const blackButton = document.getElementById("black");

whiteButton.addEventListener("click", () => {
  window.localStorage.setItem(
    "audience_state",
    JSON.stringify({
      isVisible: false,
      backgroundColor: "white",
    })
  );
});

blackButton.addEventListener("click", () => {
  window.localStorage.setItem(
    "audience_state",
    JSON.stringify({
      isVisible: false,
      backgroundColor: "black",
    })
  );
});

const renderControl = () => {
  const questionsElement = document.getElementById("questions");
  const templateElement = document.querySelector("template").content;

  const nodes = config.questions.map(({ id, question, answers }) => {
    const clone = document.importNode(templateElement, true);
    const labelElement = clone.querySelector("label");
    const optionsElement = clone.querySelector(".options");
    const controlsElement = clone.querySelector(".controls");

    // Save the id for the controls and render question name.
    controlsElement.dataset.id = id;
    optionsElement.setAttribute("name", id);
    labelElement.textContent = `${id}: ${question}`;

    // Show the prefilled questions.
    for (const [i, answer] of answers.entries()) {
      const option = optionsElement.children[i];
      option.hidden = false;
      option.value = answer;
    }

    // Get the controls
    const [startButton, endButton, publishButton] = controlsElement.children;

    startButton.addEventListener("click", (event) => {
      console.log("started voting");
      const formData = new FormData(optionsElement);
      const options = [...formData.values()]
        .filter(Boolean)
        .map((answer) => ({ answer }));
      window.localStorage.setItem(
        "audience_state",
        JSON.stringify({
          isVisible: true,
          backgroundColor: "white",
          options,
        })
      );
      endButton.disabled = false;
      publishButton.disabled = false;
      event.target.disabled = true;
    });

    endButton.addEventListener("click", (event) => {
      event.preventDefault();
      console.log("ended voting");
      publishButton.enabled = false;
      event.target.disabled = true;
    });

    publishButton.addEventListener("click", (event) => {
      event.preventDefault();
      console.log("publishing results");
      endButton.disabled = true;
      event.target.disabled = true;
    });

    return clone;
  });

  questionsElement.replaceChildren(...nodes);
};

renderControl();
