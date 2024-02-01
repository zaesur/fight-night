//create a matrix of all votes received from all voting ID's and download as a csv file
//rows form all answers per question
//collumns form all answers per voter

var answerMatrix = [[]];
var answerRow = [];


Object.keys(localStorage).forEach(key=> {
//map through all localstorage objects
    var storObj = JSON.parse(localStorage.getItem(key))

    if (storObj.questionId) {
        storObj.options.forEach(el =>
            //for each option
            el.keypadIds.forEach(id =>
                answerRow[id] = el.optionId
                //store the vote in the appropriate space in the answerRow   
            )
        )
    answerMatrix[storObj.questionId] = answerRow
    //store the row in the right collumn
    }
})



//create csvContent
let csvContent = "data:text/csv;charset=utf-8," 
    + answerMatrix.map(e => e.join(",")).join("\n");

//download file as csv
var encodedUri = encodeURI(csvContent);
window.open(encodedUri);