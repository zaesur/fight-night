import { deserialize } from "./lib/serialize.js";

/**
 * @typedef {import("./lib/serialize.js").AudienceState} AudienceState
 */

/**
 * Deterministically renders the UI based on state.
 * @param { AudienceState } state The current state.
 * @return { void }
 */
const renderAudience = ({ isVisible, backgroundColor, options }) => {
  const bodyElement = document.querySelector("body");
  const templateElement = document.querySelector("template");
  const resultsElement = document.getElementById("results");

  // Applies to all states.
  bodyElement.style.backgroundColor = backgroundColor;
  bodyElement.style.visibility = isVisible ? "visible" : "hidden";

  // If we are not displaying we can return now.
  if (!isVisible) return;

  const renderOption = ({ optionId, optionName }) => {
    const clone = document.importNode(templateElement.content, true);

    // Set text, hide SVG
    clone.querySelector("svg").style.display = "none";
    clone.querySelector("[data-id='optionId']").textContent = optionId;
    clone.querySelector("[data-id='optionName']").textContent = optionName;
    clone.querySelector("[data-id='percentage']").style.display = "none";

    return clone;
  };

  const renderResult = ({
    optionName,
    percentage = Math.random() * 100,
    isAnimated = Math.random() > 0.5,
  }) => {
    const clone = document.importNode(templateElement.content, true);
    const svg = clone.querySelector("svg");

    // Set text, hide optionId
    clone.querySelector("[data-id='optionId']").style.display = "none";
    clone.querySelector("[data-id='optionName']").textContent = optionName;
    clone.querySelector("[data-id='percentage']").textContent =
      `${Math.round(percentage)}%`;

    // Animate SVG
    svg.querySelector("circle").setAttribute("r", percentage);
    svg
      .querySelector("animate")
      .setAttribute("values", `${isAnimated ? 0 : percentage};${percentage}`);

    return clone;
  };

  resultsElement.replaceChildren(...options.map(renderOption));
};

// Since renderAudience is deterministic we can render on every event.
window.addEventListener("storage", (event) => {
  if (event.newValue && event.key === "audience_state") {
    const state = deserialize(event.newValue);
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
  document.documentElement.style.cursor = document.fullscreenElement
    ? "none"
    : "zoom-in";
});

// Initialize on first load.
const state = deserialize(window.localStorage.getItem("audience_state"));
renderAudience(state);
