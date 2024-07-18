const utilities = require("./theUtility.js")

targetDir = "Target/";
targetFiles = utilities.listDirTree(targetDir);
// utilities.debug(targetFiles);
sourceTargetDir = "DataForThaiCompanyIdsByCategories/";
wholeThing = utilities.listDirTree(sourceTargetDir);
utilities.debug("> Total number of catagory that we scraped:", targetFiles.length, "of", wholeThing.length);

rawDataRows = 0;
for (let i = 0; i < targetFiles.length; i++) {
    // if (parseInt(targetFiles[i].split('.')[0]) < 46500) continue;
    rawDataRows += utilities.readJsonFile(targetDir + targetFiles[i], false).length;
}
utilities.debug("> Total number of raw data rows: ", rawDataRows);
utilities.debug("The number above is the estimated number of rows that should updated to p'Boy's Excel file.");

const result_b = utilities.readCSVToObj("Result/result_b.csv");
const result_o = utilities.readCSVToObj("Result/result_o.csv");

utilities.debug("> Total (converted data) rows in result_b: " + result_b.length);
utilities.debug("> Total (converted data) rows in result_o: " + result_o.length);

utilities.debug("> Total number of converted data rows: ", result_b.length + result_o.length);

pyProgress = utilities.readJsonFile("Python/config.json", false);

utilities.debug("> Total number of filled data rows: ", parseInt(pyProgress["b"]["lastProcess"]["index"]) + parseInt(pyProgress["o"]["lastProcess"]["index"]));

wholeThingCount = 0;
for (let i = 0; i < wholeThing.length; i++) {
    wholeThingCount += utilities.readCSVToObj(sourceTargetDir + wholeThing[i]).length;
}

utilities.debug("> Total number of estimated whole website data rows: ", wholeThingCount);
