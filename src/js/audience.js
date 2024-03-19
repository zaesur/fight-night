const integerRangeRegex = /(?<=\d{3,})(-|—)(?=\d{3,})/;

const formatOptionId = (optionId) =>
  `<span class="option-id">${String.fromCodePoint("①".codePointAt(0) + optionId - 1)}</span>`;

const formatOptionLabel = (name) => {
  // Match any two numbers of 3 digits or more connected by a dash.
  // If we have a match, insert a breakpoint before the dash.
  const match = integerRangeRegex.exec(name);

  return match ? `${name.slice(0, match.index)}<br>${name.slice(match.index)}` : name.split(" ").join("<br>");
};

const Audience = {
  $: {
    main: document.querySelector("main"),
    body: document.querySelector("body"),
    document: document.documentElement,
    resultTemplate: document.getElementById("result-template"),
    optionTemplate: document.getElementById("option-template"),
  },

  renderBlank({ backgroundColor }) {
    Audience.$.body.style.backgroundColor = backgroundColor;
    Audience.$.body.style.visibility = "hidden";
  },

  renderOptions({ options, showQuestion, question, showOnlyOptionId }) {
    Audience.$.body.style.backgroundColor = "white";
    Audience.$.body.style.visibility = "visible";
    Audience.$.main.classList.remove("center", "results");
    Audience.$.main.classList.add("options");

    const renderOption = ({ optionId, optionName }) => {
      const clone = document.importNode(Audience.$.optionTemplate.content, true);
      const labelNode = clone.querySelector(".option-label");

      labelNode.innerHTML = showOnlyOptionId ? formatOptionId(optionId) : `${formatOptionId(optionId)} ${optionName}`;

      return clone;
    };

    const questionElement = document.createElement("label");
    questionElement.textContent = question;
    questionElement.classList.add("option-question");

    Audience.$.main.replaceChildren(...(showQuestion ? [questionElement] : []), ...options.map(renderOption));
  },

  renderResults({ options, optionsShown, optionsAnimated, showOnlyOptionId }) {
    Audience.$.body.style.backgroundColor = "white";
    Audience.$.body.style.visibility = "visible";
    Audience.$.main.classList.remove("center", "options");
    Audience.$.main.classList.add("results");

    const renderResult = ({ optionName, optionId, percentage }) => {
      const isAnimated = optionsAnimated.includes(optionId);
      const isVisible = optionsShown.includes(optionId);
      const isIntegerRange = integerRangeRegex.test(optionName);

      if (!isVisible) {
        const div = document.createElement("div");
        div.classList.add("result-empty");
        return div;
      }

      const clone = document.importNode(Audience.$.resultTemplate.content, true);

      const svgNode = clone.querySelector("svg");
      const circleNode = svgNode.querySelector("circle");
      const animateNode = svgNode.querySelector("animate");
      const labelNode = clone.querySelector(".result-label");
      const percentageNode = clone.querySelector(".result-percentage");

      percentageNode.textContent = `${Math.round(percentage)}%`;
      labelNode.classList.toggle("number", isIntegerRange);
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

    Audience.$.main.replaceChildren(...options.map(renderResult));
  },

  renderSummary({ summary }) {
    Audience.$.body.style.backgroundColor = "white";
    Audience.$.body.style.visibility = "visible";
    Audience.$.main.classList.remove("options", "results");
    Audience.$.main.classList.add("center");

    const element = document.createElement("div");
    element.classList.add("summary");
    element.textContent = summary;
    Audience.$.main.replaceChildren(element);
  },

  renderVoterIds({ voterIds }) {
    Audience.$.body.style.backgroundColor = "white";
    Audience.$.body.style.visibility = "visible";
    Audience.$.main.classList.remove("options", "results");
    Audience.$.main.classList.add("center");

    const element = document.createElement("div");
    element.classList.add("novote");
    element.textContent = voterIds.map((id) => String(id).padStart(3, "0")).join(", ");
    mainElement.replaceChildren(element);
  },

  renderReturnRemotes({ returnRemotes }) {
    Audience.$.body.style.backgroundColor = "white";
    Audience.$.body.style.visibility = "visible";
    Audience.$.main.classList.remove("options", "results");
    Audience.$.main.classList.add("center");

    const element = document.createElement("div");
    element.classList.add("return-remotes");
    element.textContent = returnRemotes;
    Audience.$.main.replaceChildren(element);
  },

  render(state, data) {
    const map = {
      "showBlank": Audience.renderBlank,
      "showOptions": Audience.renderOptions,
      "showResults": Audience.renderResults,
      "showSummary": Audience.renderSummary,
      "showVoterIds": Audience.renderVoterIds,
      "showReturnRemotes": Audience.renderReturnRemotes,
    };

    // Necessary to show animations correctly.
    window.requestAnimationFrame(() => {
      map[state]?.(data);
    });
  },

  init() {
    // Since render is deterministic we can render on every event.
    window.addEventListener("storage", (event) => {
      if (event.newValue && event.key === "audience_state") {
        const { state, data } = JSON.parse(event.newValue);
        Audience.render(state, data);
      }
    });

    // Fullscreen needs to be triggered by a user event.
    document.addEventListener("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        Audience.$.document.requestFullscreen();
      }
    });

    // Hide the mouse in fullscreen, else show a magnifying glass.
    document.addEventListener("fullscreenchange", () => {
      Audience.$.document.style.cursor = document.fullscreenElement ? "none" : "zoom-in";
    });

    // Initialize on first load.
    if ("audience_state" in localStorage) {
      const { state, data } = JSON.parse(window.localStorage.getItem("audience_state"));
      Audience.render(state, data);
    }
  },
};

Audience.init();
