const resultTemplateElement = document.getElementById("result-template");
const optionTemplateElement = document.getElementById("option-template");
const bodyElement = document.querySelector("body");
const mainElement = document.querySelector("main");

const integerRangeRegex = /(?<=\d{3,})(-|—)(?=\d{3,})/;

const formatOptionId = (optionId) => String.fromCodePoint("①".codePointAt(0) + optionId - 1);

const formatOptionLabel = (name) => {
  // Match any two numbers of 3 digits or more connected by a dash.
  // If we have a match, insert a breakpoint before the dash.
  const match = integerRangeRegex.exec(name);

  return match ? `${name.slice(0, match.index)}<br>${name.slice(match.index)}` : name.split(" ").join("<br>");
};

const renderBlank = ({ backgroundColor }) => {
  bodyElement.style.backgroundColor = backgroundColor;
  bodyElement.style.visibility = "hidden";
};

const renderOptions = ({ options, showQuestion, question, showOnlyOptionId }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";
  mainElement.classList.remove("center", "results");
  mainElement.classList.add("options");

  const renderOption = ({ optionId, optionName }) => {
    const clone = document.importNode(optionTemplateElement.content, true);
    const labelNode = clone.querySelector(".option-label");

    labelNode.textContent = showOnlyOptionId ? formatOptionId(optionId) : `${formatOptionId(optionId)} ${optionName}`;

    return clone;
  };

  const questionElement = document.createElement("label");
  questionElement.textContent = question;
  questionElement.classList.add("option-question");

  mainElement.replaceChildren(...(showQuestion ? [questionElement] : []), ...options.map(renderOption));
};

const renderResults = ({ options, optionsShown, optionsAnimated, showOnlyOptionId }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";
  mainElement.classList.remove("center", "options");
  mainElement.classList.add("results");

  const renderResult = ({ optionName, optionId, percentage }) => {
    const isAnimated = optionsAnimated.includes(optionId);
    const isVisible = optionsShown.includes(optionId);
    const isIntegerRange = integerRangeRegex.test(optionName);

    if (!isVisible) {
      const div = document.createElement("div");
      div.classList.add("result-empty");
      return div;
    }

    const clone = document.importNode(resultTemplateElement.content, true);

    const svgNode = clone.querySelector("svg");
    const circleNode = svgNode.querySelector("circle");
    const animateNode = svgNode.querySelector("animate");
    const labelNode = clone.querySelector(".result-label");
    const percentageNode = clone.querySelector(".result-percentage");

    percentageNode.textContent = `${Math.round(percentage)}%`;
    labelNode.innerHTML = showOnlyOptionId ? formatOptionId(optionId) : formatOptionLabel(optionName);

    if (isAnimated) {
      circleNode.setAttribute("r", 0);
      animateNode.setAttribute("values", `0;${percentage}`);
    } else {
      circleNode.setAttribute("r", percentage);
      circleNode.removeChild(animateNode);
    }

    return clone;
  };

  mainElement.replaceChildren(...options.map(renderResult));
};

const renderSummary = ({ summary }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";
  mainElement.classList.remove("options", "results");
  mainElement.classList.add("center");

  const element = document.createElement("div");
  element.classList.add("summary");
  element.textContent = summary;
  mainElement.replaceChildren(element);
};

const renderVoterIds = ({ voterIds }) => {
  bodyElement.style.backgroundColor = "white";
  bodyElement.style.visibility = "visible";
  mainElement.classList.remove("options", "results");
  mainElement.classList.add("center");

  const element = document.createElement("div");
  element.classList.add("novote");
  element.textContent = voterIds.map((id) => String(id).padStart(3, "0")).join(", ");
  mainElement.replaceChildren(element);
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
