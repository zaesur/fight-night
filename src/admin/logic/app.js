import Client from "./http.js"

export class App {
    #client
    #root

    // Private properties
    #isRunning = false
    #isPolling = false
    #keypadIds = []

    /**
     * Creates an instance of App.
     * @param { Client } client
     * @param { HTMLElement } root
     * @memberof App
     */
    constructor(client, root) {
        this.#client = client
        this.#root = root 

        this.#initialize().finally(this.#render)
    }

    #initialize = async () => {
        const response = await this.#client.getState()

        if (response.ok) {
            const json = await response.json()

            this.#isRunning = Boolean(json.result["hardware_state"])
            this.#isPolling = Boolean(json.result["active_question"])
            this.#keypadIds = json.result["keypadIds"]
        } else {
            console.warn(`Something unexpected went wrong while initializing: ${response.status}`)
        }
    }

    #start = async (number) => {
        if (this.#isRunning) {
            return
        }

        await this.#client.startHardware(0, number)
        await this.#initialize()
    }

    #stop = async () => {
        if (this.#isPolling) {
            const response = await this.#client.stopQuestion()

            if (!response.ok) return
        }

        if (this.#isRunning) {
            const response = await this.#client.stopHardware()

            if (!response.ok) return
        }

        await this.#initialize()
    }

    #render = () => {
        this.#root.innerHTML = `
            <h1>Fight Night voting system</h1>
            <p>${this.#isRunning ? "System running" : "System not running"}</p>
            <p>${this.#isPolling ? "Question active" : "No question active"}</p>
            ${this.#keypadIds.length > 0 ? `<p>Keypads active: ${this.#keypadIds}</p>` : ""}
        `

        const startButton = document.createElement("button")
        this.#root.appendChild(startButton)
        startButton.innerHTML = "Start"
        startButton.disabled = this.#isRunning
        startButton.addEventListener("click", event => {
            event.preventDefault()
            event.target.disabled = true
            this.#start(10).catch(console.warn).finally(this.#render)
        })
        
        const stopButton = document.createElement("button")
        this.#root.appendChild(stopButton)
        stopButton.innerHTML = "Stop"
        stopButton.disabled = !this.#isRunning
        stopButton.addEventListener("click", event => {
            event.preventDefault()
            event.target.disabled = true
            this.#stop().catch(console.warn).finally(this.#render)
        })

    }
}

const createApp = (apiUrl) => {
    const root = document.getElementById("app")
    const client = new Client(apiUrl)
    const app = new App(client, root)

    return app
}

export default createApp