//create a matrix of all votes received from all voting ID's and download as a csv file
//rows form all answers per question
//collumns form all answers per voter

var answerMatrix = [[]];

Object.keys(localStorage).forEach(key=> {
//map through all localstorage objects, if it contains questionId, for each voteoption, paste that option into right slot in the answerRow. Then spread that answerrow into the answermatrix


    var storObj = JSON.parse(localStorage.getItem(key))

    if (storObj.questionId) {
        var answerRow = [];
        storObj.options.forEach(el =>
            //for each option
            el.keypadIds.forEach(id =>
                answerRow[id] = el.optionId
            )
        )

        answerMatrix[storObj.questionId-1] = [...answerRow]
    }

})



//create csvContent
let csvContent = "data:text/csv;charset=utf-8," 
    + answerMatrix.map(e => e.join(",")).join("\n");

//download file as csv
var encodedUri = encodeURI(csvContent);
window.open(encodedUri);