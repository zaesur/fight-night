export default class Client {
  #baseUrl: URL;

  constructor(baseUrl: string | URL) {
    this.#baseUrl = new URL(baseUrl);
  }

  #getUrl = (path: string | URL) => new URL(path, this.#baseUrl);

  getState = () =>
    fetch(this.#getUrl("api/state"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

  startHardware = (min: number, max: number) =>
    fetch(this.#getUrl("api/hardware/start"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        keyPadMin: min,
        keyPadMax: max,
      }),
    });

  stopHardware = () =>
    fetch(this.#getUrl("api/hardware/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

  startQuestion = (answersCount: number) =>
    fetch(this.#getUrl("api/question/start"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        items: answersCount,
      }),
    });

  stopQuestion = () =>
    fetch(this.#getUrl("api/question/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

  getResults = () =>
    fetch(this.#getUrl("api/question/results"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
}
