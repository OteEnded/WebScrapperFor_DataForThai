const utilites = require('./theUtility.js');

utilites.debug("Reading CSV file");
const results = utilites.readCSVToObj('BusinessCatagoryList.csv');
utilites.debug(results);

let catagoryIdList = [];
for (let i = 0; i < results.length; i++) {
    catagoryIdList.push(results[i]['รหัส']);
}
utilites.debug(catagoryIdList);
