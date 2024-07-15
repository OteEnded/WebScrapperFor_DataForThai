const utilites = require('./theUtility.js');
const fs = require('fs');

// Function to write JSON file
function writeJsonFile(filePath, data) {

    utilites.ensureDirectoryExistence(filePath.split('/').slice(0, -1).join('/'));

    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err && err.code === 'ENOENT') {
            // If file doesn't exist, create it with the new data as an array
            fs.writeFile(filePath, JSON.stringify(data, null, 4), (err) => {
                if (err) throw err;
                // debug('File created and data written successfully.');
            });
        } else if (err) {
            // Handle other errors
            throw err;
        } else {
            // Parse the existing data
            let jsonData;
            try {
                jsonData = JSON.parse(fileData);
                if (!Array.isArray(jsonData)) {
                    jsonData = [jsonData];
                }
            } catch (parseErr) {
                console.error(debug('Error parsing JSON:', parseErr));
                return;
            }

            // Append the new data
            jsonData.push(data);

            // Write the updated data back to the file
            fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), (err) => {
                if (err) throw err;
                // debug('Data appended successfully.');
            });
        }
    });
}

targetPath = "Target/"

fileList = utilites.listDirTree(targetPath)
console.log(fileList);

// process.exit(0);


for (let i = 0; i < fileList.length; i++) {
    console.log(fileList[i]);
    temp = utilites.readJsonFile(targetPath + fileList[i]);
    writeJsonFile("./Temp/" + fileList[i], temp[0]);
}