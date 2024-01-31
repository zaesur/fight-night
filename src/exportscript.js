var answerMatrix = [[]];
var answerCollumn = [];


Object.keys(localStorage).forEach(key=> {
    var storObj = JSON.parse(localStorage.getItem(key))

    if (storObj.questionId) {
        storObj.options.forEach(el =>
            el.keypadIds.forEach(id =>
                answerCollumn[id] = el.optionId
            )
        )
    answerMatrix[storObj.questionId] = answerCollumn
    }
})


let csvContent = "data:text/csv;charset=utf-8," 
    + answerMatrix.map(e => e.join(",")).join("\n");

var encodedUri = encodeURI(csvContent);
window.open(encodedUri);



// JSON.parse(localStorage.question_1).options.forEach(el =>
//     el.keypadIds.forEach(id =>
//         answerCollumn[id] = el.optionId
//     )
// )



// Math.max(
//     ...JSON.parse(localStorage.question_1).options[0].keypadIds
// )