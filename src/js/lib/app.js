import Client from "./client.js";
import { apiUrl, key } from "../../config.js";
import { getStatistics } from "./utils.js";

export default class App {
  #client;
  id;
  count;
  render;

  systemIsActive = false;
  questionIsActive = false;

  constructor(render) {
    this.#client = new Client(apiUrl);

    this.id = 1;
    this.count = 10;
    this.render = render.bind(this);

    this.initialize();
  }

  initialize = async () => {
    await this.getState();

    if (!this.systemIsActive) {
      await this.#client.startHardware(0, this.count);
    }

    this.render();
  };

  getState = async () => {
    const response = await this.#client.getState();

    if (response.ok) {
      const json = await response.json();

      this.systemIsActive = Boolean(json.result["hardware_state"]);
      this.questionIsActive = Boolean(json.result["active_question"]);
    }
  };

  startQuestion = async (count) => {
    const response = await this.#client.startQuestion(count);
  };

  getResults = async () => {
    const response = await this.#client.getResults();

    if (response.ok) {
      const json = await response.json();
      const statistics = getStatistics(json.result);
    }
  };

  showResults = async () => {
    const response = await this.#client.stopQuestion();

    if (response.ok) {
      const json = await response.json();
      const statistics = getStatistics(json.result);
    }
  };
}
