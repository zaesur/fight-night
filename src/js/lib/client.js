/**
 * @typedef {Client} Client
 * @typedef {ClientError} ClientError
 * @typedef {{result: "ok"}} OkResponse
 * @typedef {{result: { keypadId: number, options: number[]}[]}} QuestionResponse
 * @typedef {{result: { keypadIds: number[], active_question: boolean, hardware_state: boolean }}} StateResponse
 */

export class ClientError extends Error {
  /**
   * Creates an instance of ClientError.
   * @param { str } message
   * @param { str } reason
   * @memberof ClientError
   */
  constructor(message, reason) {
    super(message);
    this.reason = reason;
  }
}

export default class Client {
  #baseUrl;

  /**
   * Creates an instance of Client to make requests to the voting API.
   * @param { string | URL } baseUrl The base URL of the API
   * @throws TypeError when not given a valid URL
   * @memberof Client
   */
  constructor(baseUrl) {
    this.#baseUrl = new URL(baseUrl);
  }

  /**
   * Creates a complete URL given a relative path.
   * May be used to generate API routes.
   * @param { string | URL } path The relative path to the resource
   * @private
   * @returns { URL }
   * @memberof Client
   */
  #getUrl = (path) => new URL(path, this.#baseUrl);

  #withClientError =
    (message, fetchCallback) =>
    async (...fetchCallbackArgs) => {
      try {
        const response = await fetchCallback(...fetchCallbackArgs);

        if (response.ok) {
          return response.json();
        } else {
          const isJsonResponse = response.headers
            .get("Content-Type")
            .includes("application/json");

          if (isJsonResponse) {
            const json = await response.json();
            throw new ClientError(
              message,
              json["error"] ?? json["message"] ?? "unknown reason"
            );
          } else {
            throw new ClientError(message, await response.text());
          }
        }
      } catch (error) {
        throw error;
      }
    };

  /**
   * Requests the current state of the voting system.
   * @returns { Promise<StateResponse> } A response object
   * @throws { ClientError }
   * @memberof Client
   */
  getState = this.#withClientError("Failed to get the state.", () =>
    fetch(this.#getUrl("api/state"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
      },
    })
  );

  /**
   * Requests to start the voting system.
   * @param { number } keyPadMin Starting id of voting hardware
   * @param { number } keyPadMax Ending id of the voting hardware
   * @returns { Promise<OkResponse> } A response object
   * @throws { ClientError }
   * @memberof Client
   */
  startHardware = this.#withClientError(
    "Failed to start the hardware",
    (keyPadMin, keyPadMax) =>
      fetch(this.#getUrl("api/hardware/start"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ keyPadMin, keyPadMax }),
      })
  );

  /**
   * Requests to stop the voting system.
   * @returns { Promise<Promise<OkResponse>> } A response object
   * @throws { ClientError }
   * @memberof Client
   */
  stopHardware = this.#withClientError("Failed to stop the hardware", () =>
    fetch(this.#getUrl("api/hardware/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
  );

  /**
   * Requests the voting sytem to start of a new question.
   * @param { number } items The number of available answers
   * @returns { Promise<Promise<OkResponse>> } A response object
   * @memberof Client
   */
  startQuestion = this.#withClientError(
    "Failed to start the question",
    (items) =>
      fetch(this.#getUrl("api/question/start"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ items }),
      })
  );

  /**
   * Requests the voting system to close the question.
   * @returns { Promise<QuestionResponse> } A response object
   * @memberof Client
   */
  stopQuestion = this.#withClientError("Failed to stop the question", () =>
    fetch(this.#getUrl("api/question/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
  );

  /**
   * Requests the current results from the voting system,
   * without closing the question.
   * @returns { Promise<QuestionResponse> } A response object
   * @memberof Client
   */
  getResults = this.#withClientError("Failed to get the results", () =>
    fetch(this.#getUrl("api/question/results"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
  );
}
