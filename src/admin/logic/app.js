import Client from "./http.js"

export class App {
    #client
    #root

    // Private properties
    #isRunning = false
    #isPolling = false

    /**
     * Creates an instance of App.
     * @param { Client } client
     * @param { HTMLElement } root
     * @memberof App
     */
    constructor(client, root) {
        this.#client = client
        this.#root = root 

        this.#initialize()
    }

    #initialize = () => {
        const handleResponse = async (response) => {
            if (response.ok) {
                const json = await response.json()

                this.#isRunning = Boolean(json.result["hardware_state"])
                this.#isPolling = Boolean(json.result["active_question"])
            } else {
                console.warn(`Something unexpected went wrong while initializing: ${response.status}`)
            }

            this.#render()
        }

        this.#client
            .getState()
            .then(handleResponse)
    }

    #render = () => {
        this.#root.innerHTML = `
            <p>${this.#isRunning ? "System running" : "System not running"}</p>
            <p>${this.#isPolling ? "Question active" : "No question active"}</p>
        `
    }
}

const createApp = (apiUrl) => {
    const root = document.getElementById("app")
    const client = new Client(apiUrl)
    const app = new App(client, root)

    return app
}

export default createApp