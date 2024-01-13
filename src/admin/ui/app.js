export const App = (callback) => {
    const innerHTML = `
        <h1> Fight Night control panel</h1>
        <label>
            How many voters?
            <input type="number" min="0" value="100" id="count" />
        </label>
        <input type="submit" value="Initialize" id="submit" />
    `

    const app = document.createElement("div")
    app.innerHTML = innerHTML
    
    const count = app.querySelector("#count")
    const submit = app.querySelector("#submit")

    submit.addEventListener("click", (event) => {
        event.preventDefault()
        callback(count.value)
    })
    
    return app
}