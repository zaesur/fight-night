import Body from "./body.js"
import Header from "./header.js"

export const App = (callback) => {
    const app = document.createElement("div")

    app.appendChild(Header())
    app.appendChild(Body(callback))
    
    return app
}