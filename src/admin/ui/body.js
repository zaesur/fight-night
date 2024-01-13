export const Body = (callback) => {
    const body = document.createElement("form")
    const innerHTML = `
        <label>
            How many voters?
            <input type="number" min="0" value="100" id="count" />
        </label>
        <input type="submit" value="Initialize" id="submit" />
    `
    body.innerHTML = innerHTML

    const count = body.querySelector("#count")
    const submit = body.querySelector("#submit")

    submit.addEventListener("click", (event) => {
        event.preventDefault()
        callback(count.value)
    })

    return body
}

export default Body