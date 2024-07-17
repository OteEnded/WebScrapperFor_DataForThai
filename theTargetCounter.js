const utilities = require("./theUtility.js")

targetDir = "Target/";
targetFiles = utilities.listDirTree(targetDir);
console.log(targetFiles);
console.log("Total files in target data: " + targetFiles.length);

rawDataRows = 0
for (let i = 0; i < targetFiles.length; i++) {
    // if (parseInt(targetFiles[i].split('.')[0]) < 46500) continue;
    rawDataRows += utilities.readJsonFile(targetDir + targetFiles[i]).length;
}
console.log("Total rows in target data: " + rawDataRows);