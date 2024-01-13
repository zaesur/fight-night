import { App as renderApp } from "../ui/app.js"
import Client from "./http.js"

export class App {
    #client
    #root

    /**
     * Creates an instance of App.
     * @param { Client } client
     * @param { HTMLElement } root
     * @memberof App
     */
    constructor(client, root) {
        this.#client = client
        this.#root = root 

        this.#render()
    }

    #render = () => {
        const app = renderApp((number) => console.log(`The number is: ${number}`))
        this.#root.replaceChildren(app)
    }
}

const createApp = (apiUrl) => {
    const root = document.getElementById("app")
    const client = new Client(apiUrl)
    const app = new App(client, root)

    return app
}

export default createApp