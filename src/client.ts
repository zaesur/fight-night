export default class Client {
  #baseUrl: URL;

  constructor(baseUrl: string | URL) {
    this.#baseUrl = new URL(baseUrl);
  }

  getURL = (path: string | URL) => new URL(path, this.#baseUrl);

  getState = () =>
    fetch(this.getURL("api/state"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
      },
    });

  startHardware = (keyPadMin: number, keyPadMax: number) =>
    fetch(this.getURL("api/hardware/start"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        keyPadMin,
        keyPadMax,
      }),
    });

  stopHardware = () =>
    fetch(this.getURL("api/hardware/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

  startQuestion = (items: number) =>
    fetch(this.getURL("api/question/start"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        items,
      }),
    });

  stopQuestion = () =>
    fetch(this.getURL("api/question/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

  getResults = () =>
    fetch(this.getURL("api/question/results"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
}
