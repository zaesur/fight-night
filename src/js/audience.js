import { deserialize } from "./lib/serialize.js";

/**
 * @typedef {import("./lib/serialize.js").AudienceState} AudienceState
 */

/**
 * Deterministically renders the UI based on state.
 * @param { AudienceState } state The current state.
 * @return { void }
 */
const renderAudience = ({ isVisible, backgroundColor, options, results }) => {
  const bodyElement = document.querySelector("body");
  const templateElement = document.querySelector("template");
  const resultsElement = document.getElementById("results");

  // Applies to all states.
  bodyElement.style.backgroundColor = backgroundColor;
  bodyElement.style.visibility = isVisible ? "visible" : "hidden";

  // Render options.
  const nodes = options.map(({ optionId, optionName }, index) => {
    const clone = document.importNode(templateElement.content, true);
    const label = clone.querySelector("label");
    label.textContent = `${optionId}: ${optionName}`;

    const result = results.find((result) => result.optionId === optionId);
    if (result) {
      label.textContent = label.textContent + "\n" + result.votes;
    }

    return clone;
  });

  resultsElement.replaceChildren(...nodes);
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
