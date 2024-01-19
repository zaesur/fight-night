import { calcRadius } from "../src/utils.js";

export const createOptionNode = (template, answer) => {
  const clone = document.importNode(template, true);
  const label = clone.querySelector("label");

  label.textContent = answer;

  return clone;
};

export const createResultNode = (template, reference, answer, percentage) => {
  const clone = document.importNode(template, true);
  const svg = clone.querySelector("svg");
  const circle = clone.querySelector("circle");
  const animate = clone.querySelector("animate");
  const label = clone.querySelector("label");
  const radius = calcRadius(25, reference, percentage);

  svg.style.visibility = "inherit";
  circle.setAttribute("r", radius);
  animate.setAttribute("values", `0;${radius}`);
  label.textContent = `${answer}: ${percentage}%`;

  return clone;
};
