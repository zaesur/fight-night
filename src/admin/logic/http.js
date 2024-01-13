export default class Client {
    #baseUrl;

    /**
     * Creates an instance of Client to make requests to the voting API.
     * @param { string | URL } baseUrl The base URL of the API
     * @throws TypeError when not given a valid URL
     * @memberof Client
     */
    constructor(baseUrl) {
        this.#baseUrl = new URL(baseUrl)
    }

    /**
     * Creates a complete URL given a relative path.
     * May be used to generate API routes.
     * @param { string | URL } path The relative path to the resource
     * @private
     * @memberof Client
     */
    #getUrl = path => new URL(path, this.#baseUrl)

    /**
     * Requests the current state of the voting system.
     * @returns { Promise<Response> } A response object
     * @memberof Client
     */
    getState = () => fetch(
        this.#getUrl("api/state"),
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            }
        }
    )

    /**
     * Requests to start the voting system.
     * @param { number } min Starting id of voting hardware
     * @param { number } max Ending id of the voting hardware
     * @returns { Promise<Response> } A response object
     * @memberof Client
     */
    startHardware = (min, max) => fetch(
        this.#getUrl("api/hardware/start"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                "keyPadMin": min,
                "keyPadMax": max
            })
        }
    )

    /**
     * Requests to stop the voting system.
     * @returns { Promise<Response> } A response object
     * @memberof Client
     */
    stopHardware = () => fetch(
        this.#getUrl("api/hardware/stop"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    )


    /**
     * Requests the voting sytem to start of a new question.
     * @param { number } answersCount The number of available answers
     * @returns { Promise<Response> } A response object
     * @memberof Client
     */
    startQuestion = (answersCount) => fetch(
        this.#getUrl("api/question/start"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                items: answersCount
            })
        }
    )

    /**
     * Requests the voting system to close the question.
     * @returns { Promise<Response> } A response object
     * @memberof Client
     */
    stopQuestion = () => fetch(
        this.#getUrl("api/question/start"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    )

    /**
     * Requests the current results from the voting system,
     * without closing the question.
     * @returns { Promise<Response> } A response object
     * @memberof Client
     */
    getResults = () => fetch(
        this.#getUrl("api/question/results"),
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    )
}