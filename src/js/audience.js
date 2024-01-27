/**
 * Represents the data of a single object.
 * @typedef {{ name: str, votes: int }} Option
 */

/**
 * Represents the state of the audience UI.
 * @typedef {{ isVisible: bool, backgroundColor: "black" | "white", options?: Option[] }} AudienceState
 */

/**
 * A wrapper function to aid with intellisense.
 * @param { str } raw String data.
 * @return { AudienceState } The state of the audience UI.
 */
const deserialize = (raw) => JSON.parse(raw);

/**
 * Deterministically enders the UI based on state.
 * @param { AudienceState } state The current state.
 * @return { void }
 */
const renderAudience = (
  { isVisible, backgroundColor, options } = {
    isVisible: false,
    backgroundColor: "white",
    options: undefined,
  }
) => {
  const bodyElement = document.querySelector("body");
  const templateElement = document.querySelector("template");
  const resultsElement = document.getElementById("results");

  // Applies to all states.
  bodyElement.style.backgroundColor = state.backgroundColor;
  bodyElement.style.visibility = state.isVisible ? "visible" : "hidden";

  // Render options.
  const nodes = options.map(({ answer, votes }) => {
    const clone = document.importNode(templateElement.content, true);
    const label = clone.querySelector("label");
    label.textContent = votes ? `${answer}: ${votes}` : answer;
    return clone;
  });

  resultsElement.replaceChildren(...nodes);
};

window.addEventListener("storage", (event) => {
  if (event.newValue && event.key === "audience_state") {
    const state = deserialize(event.newValue);
    renderAudience(state);
  }
});

document.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  document.documentElement.style.cursor = document.fullscreenElement
    ? "none"
    : "zoom-in";
});

// Initialize on first load.
const state = deserialize(window.localStorage.getItem("audience_state"));
renderAudience(state);
