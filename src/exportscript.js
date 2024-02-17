//create a matrix of all votes received from all voting ID's and download as a csv file
//rows form all answers per question
//collumns form all answers per voter

const answerMatrix = [[]];

Object.entries(localStorage).forEach(([key, value]) => {
  //map through all localstorage objects, if it contains questionId, for each voteoption, paste that option into right slot in the answerRow. Then spread that answerrow into the answermatrix

  const storObj = JSON.parse(value);

  if (storObj.questionId) {
    const answerRow = [];
    storObj.options.forEach((el) =>
      //for each option
      el.keypadIds.forEach((id) => (answerRow[id] = el.optionId))
    );

    answerMatrix[storObj.questionId - 1] = [...answerRow];
  }
});

//create csvContent
const csvContent = answerMatrix.map((e) => e.join(",")).join("\n");
const csvFile = `data:text/csv;charset=utf-8,${csvContent}`;

//download file as csv
const encodedUri = encodeURI(csvFile);
window.open(encodedUri);
