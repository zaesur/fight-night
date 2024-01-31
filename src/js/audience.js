const templateElement = document.querySelector("template");

/**
 *
 * @param {*} param0
 * @returns
 */
const renderOption = ({ optionId, optionName }) => {
  const clone = document.importNode(templateElement.content, true);

  // Set text, hide SVG
  clone.querySelector("svg").style.display = "none";
  clone.querySelector("[data-id='percentage']").style.display = "none";
  clone.querySelector("[data-id='optionName']").textContent =
    `${String.fromCodePoint(0x245f + optionId)} ${optionName}`;

  return clone;
};

/**
 *
 * @param {*} param0
 * @returns
 */
const renderResult = ({ optionName, percentage, isAnimated }) => {
  const clone = document.importNode(templateElement.content, true);
  const svg = clone.querySelector("svg");

  clone.querySelector("[data-id='optionName']").textContent = optionName;
  clone.querySelector("[data-id='percentage']").textContent = `${Math.round(percentage)}%`;

  // Animate SVG
  svg.querySelector("circle").setAttribute("r", percentage);
  svg.querySelector("animate").setAttribute("values", `${isAnimated ? 0 : percentage};${percentage}`);

  return clone;
};

/**
 * Deterministically renders the UI based on state.
 * @param { any } state The current state.
 * @return { void }
 */
const renderAudience = ({ isVisible, isAnswered, backgroundColor, options }) => {
  const bodyElement = document.querySelector("body");
  const resultsElement = document.getElementById("results");

  // Applies to all states.
  bodyElement.style.backgroundColor = backgroundColor;
  bodyElement.style.visibility = isVisible ? "visible" : "hidden";

  // If we are not displaying we can return now.
  if (!isVisible) return;

  resultsElement.replaceChildren(...options.map(isAnswered ? renderResult : renderOption));
};

// Since renderAudience is deterministic we can render on every event.
window.addEventListener("storage", (event) => {
  if (event.newValue && event.key === "audience_state") {
    const state = JSON.parse(event.newValue);
    renderAudience(state);
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
const state = JSON.parse(window.localStorage.getItem("audience_state"));
renderAudience(state);
