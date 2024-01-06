import configuration from "./config.json" assert { type: "json" };

const createQuestionElement = ({ question, answers}) => {
    const questionElement = document.createElement("li")

    questionElement.textContent = `${question} ${answers}`

    return questionElement
}

const renderQuestions = (id, questions) => {
    const container = document.getElementById(id)
    const listElement = document.createElement('ul')
    const questionElements = questions.map(createQuestionElement)

    listElement.append(...questionElements)
    container.append(listElement)
}

renderQuestions("container", configuration.questions.slice(0, 4))