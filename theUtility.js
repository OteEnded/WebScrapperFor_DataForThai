const path = require('path');
const fs = require('fs');
const notifier = require('node-notifier');

function readCSVToObj(filePath) {
    const results = [];
    let headers = [];

    const fileContent = fs.readFileSync(filePath, 'utf-8').split('\n');

    fileContent.forEach((line, index) => {
        if (index === 0) {
            // Assuming the first line contains headers
            headers = line.trim().split(',');
        } else {
            const obj = {};
            const values = line.trim().split(',');
            headers.forEach((header, i) => {
                obj[header] = values[i];
            });
            results.push(obj);
        }
    });

    return results;
}

function decodeCompanyID(companyId) {
    return companyId.substr(0, 6) + companyId.substr(12, 1) + companyId.substr(7, 5) + companyId.substr(6, 1);
}

function getCompanyUrl(companyId) {
    return "https://www.dataforthai.com/company/" + decodeCompanyID(companyId) + "/";
}

// Function to write JSON file
function writeJsonFile(path, data) {
    fs.readFile(path, 'utf8', (err, fileData) => {
        if (err && err.code === 'ENOENT') {
            // If file doesn't exist, create it with the new data as an array
            fs.writeFile(path, JSON.stringify([data], null, 4), (err) => {
                if (err) throw err;
                debug('File created and data written successfully.');
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
            fs.writeFile(path, JSON.stringify(jsonData, null, 4), (err) => {
                if (err) throw err;
                debug('Data appended successfully.');
            });
        }
    });
}

// Function to read JSON file to Object
function readJsonFile(filePath){
    debug("theUtility[readJSONFile]: Reading JSON file from", filePath)
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonData);
        debug("theUtility[readJSONFile]: Data from", filePath, "can be read successfully and will be return.")
        return data
    } catch (err) {
        console.error('theUtility[readJSONFile]: ERROR, cannot read file from', filePath);
        console.error(err);
        return null
    }
}

// Function to get .env data
function getEnv() {
    return readJsonFile('.env.json');
}

function isFileExists(filePath) {
    return fs.existsSync(filePath);
}

function findOne(objList, options) {
    const { where } = options;

    // Iterate over the list of objects
    for (const obj of objList) {
        // Assume the object matches until proven otherwise
        let isMatch = true;

        // Check all conditions in the 'where' clause
        for (const [key, value] of Object.entries(where)) {
            if (obj[key] !== value) {
                isMatch = false;
                break;
            }
        }

        // If all conditions match, return the object
        if (isMatch) {
            return obj;
        }
    }

    // Return null if no matching object is found
    return null;
}

function resolveCatagory(catagoryId){
    const catagoryList = readCSVToObj('BusinessCatagoryList.csv');
    return findOne(catagoryList, { where: { 'รหัส': catagoryId } });
}

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function debug(...args) {
    try {
        // Get the current time
        const currentTime = new Date().toLocaleTimeString();

        // Combine all log arguments into a single string
        const logMessage = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');

        // Ensure the log directory exists
        ensureDirectoryExistence('./logs/log.txt');

        // Append the log message with the current time to a text file
        fs.appendFileSync('./logs/log.txt', `[${currentTime}] ${logMessage}\n`);

        // Log the message with the current time to the console
        console.log(`[${currentTime}]`, ...args);
        return `[${currentTime}] ${logMessage}`;
    }
    catch (err) {
        console.error('theUtility[debug]: ERROR, cannot log message to file');
        console.error(err);
        console.log(...args);
        return err;
    }
};

// Function to notify completion with default OS sound
function notifyTaskCompletion(title = 'Task Complete', message = 'Your program has finished running.') {
    notifier.notify({
        title: title,
        message: message,
        sound: true, // This will play the default notification sound
        wait: false
    });
    debug('theUtility[notifyTaskCompletion]: Set off a notification');
}

module.exports = {
    readCSVToObj,
    decodeCompanyID,
    getCompanyUrl,
    writeJsonFile,
    readJsonFile,
    getEnv,
    isFileExists,
    findOne,
    resolveCatagory,
    ensureDirectoryExistence,
    debug,
    notifyCompletion: notifyTaskCompletion
};