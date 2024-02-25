const templateElement = document.querySelector("template");
const bodyElement = document.querySelector("body");
const resultsElement = document.getElementById("results");
const questionElement = document.getElementById("question");

const getUnicodeForOptionId = (optionId) => String.fromCodePoint("①".codePointAt(0) + optionId - 1);

const resizeVoterIds = () => {
  const element = document.querySelector(".novote");

  // Make sure the voter IDs never exceed the container
  let fontSize = parseInt(window.getComputedStyle(bodyElement).fontSize);
  element.style.fontSize = fontSize + "px";

  while (element.offsetHeight > resultsElement.offsetHeight * 0.8) {
    element.style.fontSize = --fontSize + "px";
  }
};

const renderBlank = ({ backgroundColor }) => {
  bodyElement.style.backgroundColor = backgroundColor;
  bodyElement.style.visibility = "hidden";
};

const renderOptions = ({ options, showQuestion, question, showOnlyOptionId }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";

  questionElement.textContent = question;
  questionElement.style.visibility = showQuestion ? "inherit" : "hidden";

  const renderOption = ({ optionId, optionName }) => {
    const clone = document.importNode(templateElement.content, true);

    // Set text, hide SVG
    clone.querySelector("svg").style.display = "none";
    clone.querySelector("[data-id='percentage']").style.display = "none";

    clone.querySelector("[data-id='optionName']").textContent = showOnlyOptionId
      ? getUnicodeForOptionId(optionId)
      : `${getUnicodeForOptionId(optionId)} ${optionName}`;

    return clone;
  };

  resultsElement.replaceChildren(...options.map(renderOption));
};

const renderResults = ({ options, optionsShown, optionsAnimated, showOnlyOptionId }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";
  questionElement.style.visibility = "hidden";

  const renderResult = ({ optionName, optionId, percentage }) => {
    const isAnimated = optionsAnimated.includes(optionId);
    const clone = document.importNode(templateElement.content, true);
    const svg = clone.querySelector("svg");

    clone.firstElementChild.style.visibility = optionsShown.includes(optionId) ? "inherit" : "hidden";

    clone.querySelector("[data-id='optionName']").textContent = showOnlyOptionId
      ? getUnicodeForOptionId(optionId)
      : optionName;
    clone.querySelector("[data-id='percentage']").textContent = `${Math.round(percentage)}%`;

    // Animate SVG
    svg.querySelector("circle").setAttribute("r", percentage);
    svg.querySelector("animate").setAttribute("values", `${isAnimated ? 0 : percentage};${percentage}`);

    return clone;
  };

  resultsElement.replaceChildren(...options.map(renderResult));
};

const renderSummary = ({ summary }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";
  questionElement.style.visibility = "hidden";

  const element = document.createElement("div");
  element.classList.add("summary");
  element.textContent = summary;
  resultsElement.replaceChildren(element);
};

const renderVoterIds = ({ voterIds }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";
  questionElement.style.visibility = "hidden";

  const element = document.createElement("div");
  element.classList.add("novote");
  element.textContent = voterIds.map((id) => String(id).padStart(3, "0")).join(", ");
  resultsElement.replaceChildren(element);

  resizeVoterIds();
};

const render = (state, data) => {
  const map = {
    "showBlank": renderBlank,
    "showOptions": renderOptions,
    "showResults": renderResults,
    "showSummary": renderSummary,
    "showVoterIds": renderVoterIds,
  };

  map[state]?.(data);
};

window.addEventListener("resize", resizeVoterIds);

// Since renderAudience is deterministic we can render on every event.
window.addEventListener("storage", (event) => {
  if (event.newValue && event.key === "audience_state") {
    const { state, data } = JSON.parse(event.newValue);
    render(state, data);
  }
});

// Fullscreen needs to be triggered by a user event.
document.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
});

// Hide the mouse in fullscreen, else show a magnifying glass.
document.addEventListener("fullscreenchange", () => {
  document.documentElement.style.cursor = document.fullscreenElement ? "none" : "zoom-in";
});

// Initialize on first load.
if ("audience_state" in localStorage) {
  const { state, data } = JSON.parse(window.localStorage.getItem("audience_state"));
  render(state, data);
}
