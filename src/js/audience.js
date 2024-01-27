/**
 * Represents the data of a single object.
 * @typedef {{ answer: str, votes?: int }} Option
 */

/**
 * Represents the state of the audience UI.
 * @typedef {{ isVisible: bool, backgroundColor: "black" | "white", options: Option[] }} AudienceState
 */

/**
 * A wrapper function to aid with intellisense.
 * @param { str } raw String data.
 * @return { AudienceState } The state of the audience UI.
 */
const deserialize = (raw) =>
  raw
    ? JSON.parse(raw)
    : { isVisible: false, backgroundColor: "white", options: [] };

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

  // Render options.
  const nodes = options.map(({ answer, votes }) => {
    const clone = document.importNode(templateElement.content, true);
    const label = clone.querySelector("label");
    label.textContent = votes ? `${answer}: ${votes}` : answer;
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
