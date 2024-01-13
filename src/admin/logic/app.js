import Client from "./http.js"

export class App {
    #client

    constructor(client) {
        this.#client = client
    }

    startup = (...numbers) => {
        if (!numbers || !numbers.every(isFinite)) {
            throw new Error("Please provide the total number of voters or a minimum and maximum value")
        }

        // If only one number is supplied, start at 0
        const [min, max] = numbers.length === 1 ? [0, numbers[0]] : numbers

        this
            .#client
            .startHardware(min, max)
            .then(response => {
                if (response.status === 403 || response.status === 200) {
                   return Promise.all([response.status, response.json()])
                } else {
                    return [response.status, `Something unexpected happened`]
                }
            })
            .then(([status, json]) => {
                if (status === 200) {
                    console.log(json.result)
                } else if (status === 403) {
                    console.log(json.error)
                } else {
                    console.warn("Something unexpected happened")
                }
            })
    }

    shutdown = () => {
        this.#client.stopHardware()
    }
}

const createApp = (apiUrl, ...numbers) => {
    const client = new Client(apiUrl)
    const app = new App(client)
    app.startup(...numbers)

    return app
}

export default createApp