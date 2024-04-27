const express = require('express');
const xlsx = require('xlsx');
const app = express();
const cors=require('cors')
const port = 3001;
app.use(cors())
// Excel file and convert it to JSON
const filePath = 'AvocadoFoods.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// group data according to the first column
function groupDataByFirstColumn() {
    const groupedData = {};
    jsonData.slice(1).forEach(row => {
        const groupKey = row[0]; // Assuming the first column is index 0
        if (!groupedData[groupKey]) {
            groupedData[groupKey] = [];
        }
        groupedData[groupKey].push(row);
    });
    return groupedData;
}

// save data to a new file
function saveDataToFile(data, fileName) {
    const ws = xlsx.utils.aoa_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    xlsx.writeFile(wb, fileName);
}

// get max 10 according to specific column for each group
function getMax10ByColumnForGroup(groupedData, columnName) {
    const result = [];
    for (const groupKey in groupedData) {
        const groupRows = groupedData[groupKey];
        const sortedRows = groupRows.sort((a, b) => b[columnName] - a[columnName]);
        const top10 = sortedRows.slice(0, 10);
        result.push(...top10);
    }
    return result;
}

// get random value from each group
function getRandomValueFromEachGroup(groupedData) {
    const result = [];
    for (const groupKey in groupedData) {
        const groupRows = groupedData[groupKey];
        const randomRow = groupRows[Math.floor(Math.random() * groupRows.length)];
        result.push(randomRow);
    }
    return result;
}
// get max 15 rows from the random values obtained from each group
function getMax15FromRandomValues(randomValues, columnName) {
  const sortedRandomValues = randomValues.sort((a, b) => b[columnName] - a[columnName]);
  return sortedRandomValues.slice(0, 15);
}

//  endpoint 
app.post('/process', express.json(), (req, res) => {
  const columnName = req.body.columnName; // Get column name from request body
  const columnIndex = jsonData[0].indexOf(columnName); // Get column index

  const groupedData = groupDataByFirstColumn();

  const max10ByColumnForGroup = getMax10ByColumnForGroup(groupedData, columnIndex);

  const randomValueFromEachGroup = getRandomValueFromEachGroup(groupedData);



  const max15FromRandomValues = getMax15FromRandomValues(randomValueFromEachGroup, columnIndex);

//   saveDataToFile(max10ByColumnForGroup, 'max10ByColumnForGroup.xlsx');

//   saveDataToFile(randomValueFromEachGroup, 'randomValueFromEachGroup.xlsx');

//   saveDataToFile(max15FromRandomValues, 'max15FromRandomValues.xlsx');

  // Send the final response
  res.json({
      // max10ByColumnForGroup: max10ByColumnForGroup,
      // randomValueFromEachGroup: randomValueFromEachGroup,
      max15FromRandomValues: max15FromRandomValues.map(row => [row[0], row[1]]), 
      columnUsed: columnName
  });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
