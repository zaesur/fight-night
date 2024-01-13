import configuration from "./data/config.json" assert { type: "json" }
import createApp from "./logic/app.js"

createApp(configuration.apiUrl, 10)