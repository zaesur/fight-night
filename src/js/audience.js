const templateElement = document.querySelector("template");
const bodyElement = document.querySelector("body");
const resultsElement = document.getElementById("results");
const questionElement = document.getElementById("question");

const getUnicodeForOptionId = (optionId) => String.fromCodePoint("①".codePointAt(0) + optionId - 1);

const formatOptionName = (name) => {
  const match = /(\d{3,})(-|—)(\d{3,})/.exec(name);

  if (match) {
    const [, begin, dash, end] = match;
    return `${begin}<br>${dash}${end}`;
  } else {
    return name;
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

    const svgNode = clone.querySelector("svg");
    const optionIdNode = clone.querySelector(".option-id");
    const optionLabelNode = clone.querySelector(".option-label");
    const optionPercentageNode = clone.querySelector(".option-percentage");

    svgNode.style.display = "none";
    optionPercentageNode.style.display = "none";
    optionIdNode.textContent = getUnicodeForOptionId(optionId);
    optionLabelNode.style.display = showOnlyOptionId ? "none" : "inline";
    optionLabelNode.innerHTML = formatOptionName(optionName);

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

    const svgNode = clone.querySelector("svg");
    const circleNode = svgNode.querySelector("circle");
    const animateNode = svgNode.querySelector("animate");
    const optionIdNode = clone.querySelector(".option-id");
    const optionLabelNode = clone.querySelector(".option-label");
    const optionPercentageNode = clone.querySelector(".option-percentage");

    clone.firstElementChild.style.visibility = optionsShown.includes(optionId) ? "inherit" : "hidden";

    optionIdNode.textContent = getUnicodeForOptionId(optionId);
    optionIdNode.style.display = showOnlyOptionId ? "inline" : "none";
    optionLabelNode.textContent = optionName;
    optionLabelNode.style.display = showOnlyOptionId ? "none" : "inline";
    optionPercentageNode.textContent = `${Math.round(percentage)}%`;
    optionLabelNode.innerHTML = formatOptionName(optionName);

    if (isAnimated) {
      circleNode.setAttribute("r", 0);
      animateNode.setAttribute("values", `0;${percentage}`);
    } else {
      circleNode.setAttribute("r", percentage);
      circleNode.removeChild(animateNode);
    }

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
};

const render = (state, data) => {
  const map = {
    "showBlank": renderBlank,
    "showOptions": renderOptions,
    "showResults": renderResults,
    "showSummary": renderSummary,
    "showVoterIds": renderVoterIds,
  };

  // Necessary to show animations correctly.
  window.requestAnimationFrame(() => {
    map[state]?.(data);
  });
};

// Since render is deterministic we can render on every event.
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
