export default class Client {
    constructor(baseUrl) {
        try {
            // Check if baseUrl is valid, throws TypeError
            new URL(baseUrl)

            this.baseUrl = baseUrl
        } catch {
            throw new TypeError(
                "Client needs to be instantiated with a valid base url (ex. new Client('api.domain.com') )"
            )
        }
    }

    getUrl = path => `${this.baseUrl}/${path}`

    getState = () => fetch(
        this.getUrl("state"),
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            }
        }
    )

    startHardware = (min, max) => fetch(
        this.getUrl("hardware/start"),
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

    stopHardware = () => fetch(
        this.getUrl("hardware/stop"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    )

    startQuestion = (answersCount) => fetch(
        this.getUrl("question/start"),
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

    stopQuestion = () => fetch(
        this.getUrl("question/start"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    )

    getResults = () => fetch(
        this.getUrl("question/results"),
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    )
}