// Import dependencies
const puppeteer = require('puppeteer');
const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const utilites = require('./theUtility.js');
const theUtility = require('./theUtility.js');

var delayTime = 0;

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const puppeteerExtra = addExtra(puppeteer);
puppeteerExtra.use(StealthPlugin());


// Function to connect to web and return page
async function connectToWeb(url) {
    const browser = await puppeteer.launch({
        headless: utilites.getEnv()["previewpage"] == null ? true : !utilites.getEnv()["previewpage"], // Run in headful mode? (set to false for debugging)
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();
    
    // Randomize user agent
    // const userAgent = randomUseragent.getRandom();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

    // Randomize viewport size
    await page.setViewport({
        width: Math.floor(Math.random() * (1920 - 1024 + 1)) + 1024,
        height: Math.floor(Math.random() * (1080 - 768 + 1)) + 768,
        deviceScaleFactor: 1
    });

    // Set additional headers
    await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br'
    });

    // Set cookies
    await page.setCookie(utilites.getEnv().cookie);

    // Function to mimic human-like interaction
    const mimicHumanInteraction = async () => {
        await page.mouse.move(
            Math.floor(Math.random() * 800) + 100,
            Math.floor(Math.random() * 800) + 100
        );
        // await theUtility.sleep(Math.floor(Math.random() * 2) + 1); // Wait between 1-3 seconds
        // await page.mouse.click(
        //     Math.floor(Math.random() * 800) + 100,
        //     Math.floor(Math.random() * 800) + 100,
        //     { delay: Math.floor(Math.random() * 1000) + 200 } // Random delay for click
        // );
    };

    // Mimic human interactions before navigating to the page
    await mimicHumanInteraction();

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Mimic human interactions after navigation
    await mimicHumanInteraction();

    return { browser, page };
}

// // Function to connect to web and return page
// async function connectToWeb(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36');
//     await page.setCookie(utilites.getEnv().cookie);
//     await page.goto(url);
//     return { browser, page };
// }

// Function to close the connection
async function closeConnection(browser) {
    await browser.close();
}

// Function to scrape specific table
async function scrapeSpecificTable(page) {
    const specificTableData = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table'));

        // Search for the specific text within tables
        const specificTable = tables.find(table =>
            Array.from(table.querySelectorAll('td, th')).some(cell =>
                cell.innerText.includes('ที่ตั้ง')
            )
        );

        if (!specificTable) return null;

        // Extract data from the specific table
        const rows = Array.from(specificTable.querySelectorAll('tr'));
        const tableData = rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells.map(cell => cell.innerText.trim());
        });

        // Convert table data to array of objects
        const headerRow = tableData[0]; // Assuming first row is header
        const dataList = tableData.slice(1).map(row => {
            const rowData = {};
            row.forEach((cell, index) => {
                rowData[headerRow[index]] = cell;
            });
            return rowData;
        });

        return dataList;
    });

    return specificTableData;
}

// Function to scrape h2 elements
async function scrapeH2(page) {
    const h2List = await page.evaluate(() => {
        const h2Elements = Array.from(document.querySelectorAll('h2'));
        return h2Elements.map(h2 => ({ text: h2.innerText.trim() }));
    });
    return h2List;
}

const workingList = './Assigned/';
function indexDirectories(dir) {

    utilites.debug("[indexDirectories] dir to index:", dir);

    utilites.ensureDirectoryExistence(dir);
    const files = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && path.extname(dirent.name) === '.csv')
        .map(dirent => path.basename(dirent.name));

    utilites.debug("[indexDirectories] files:", files);

    return files;
}

function checkIfDone(companyId, filePath) {
    utilites.debug("[checkIfDone]: Checking if already have data by companyId for:", companyId);
    if (!utilites.isFileExists(filePath)) return false;
    // Read json file
    let jsonObj = utilites.readJsonFile(filePath); // JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let doneList = [];
    for (let i = 0; i < jsonObj.length; i++) {
        doneList.push(jsonObj[i]['เลขทะเบียน']);
    }
    // console.log(doneList);
    return doneList.includes(utilites.decodeCompanyID(companyId));
}


// Function to restart the process
function restartProcess() {
    console.log('Restarting process...');
    const scriptPath = path.resolve(__filename); // Get the absolute path to the script
    spawn(process.execPath, [scriptPath], {
        detached: true, // Run the new process in a separate session
        stdio: 'inherit' // Use the same standard input/output as the parent process
    });
    process.exit(); // Exit the current process
}

const targetDir = "./Target/";
const isSavePage = true;
let howManyThatWeGot = 0;

process.on('exit', async (code) =>  {
    utilites.debug("Process exit with code:", code);
    utilites.debug("Total companies that we got:", howManyThatWeGot);
}
);

// Main function
(async () => {
    try {
        for (let workingCatagoryFile of indexDirectories(workingList)){
            let workingCatagoryId = workingCatagoryFile.split('.')[0];
            utilites.debug("Working on catagory id:", workingCatagoryId);
            // check if catagory id is exist
            let catagory = utilites.resolveCatagory(workingCatagoryId);
            if (!catagory) {
                utilites.debugError("Catagory is not found!!!");
                continue;
            }
            utilites.debug("Working on catagory:", catagory['ประเภทธุรกิจ'], "| estimated amount (from csv):", catagory['จำนวน']);
            let companyIds = [];
            for (let csvRow of utilites.readCSVToObj(workingList + workingCatagoryFile)) {
                companyIds.push(...Object.values(csvRow));
            }
            utilites.debug("Company ids in this catagory:", companyIds);
            // Loop through company ids
            for (let companyId of companyIds) {
                // Check if empty string
                if (companyId === '')  continue;
                utilites.debug("Working on company id:", companyId, "(catagory id:", workingCatagoryId, ")", "[", companyIds.indexOf(companyId) + 1, "/", companyIds.length - 1, "]");
                // Check if done
                if (checkIfDone(companyId, targetDir + workingCatagoryId + '.json')) {
                    utilites.debug("Company id:", companyId, "is already done!!!");
                    continue;
                }
                utilites.debug("Starting to scrape data for company:", companyId);
                
                if (utilites.getEnv().delay.length == 1) {
                    delayTime = utilites.getEnv().delay[0];
                }
                else {
                    delayTime = utilites.getRandomIntInRange(utilites.getEnv().delay[0], utilites.getEnv().delay[1]);
                }

                const url = utilites.getCompanyUrl(companyId);
                utilites.debug("Connecting to:", url);
                const { browser, page } = await connectToWeb(url);

                // save page's html to file
                try {
                    const htmlContent = await page.content();
                    if (isSavePage) {
                        theUtility.ensureDirectoryExistence('./Temp/');
                        // Get the HTML content of the page
                        const filename = './Temp/page.html';
                        fs.writeFileSync(filename, htmlContent, 'utf8');
                        console.log(`Page saved as ${filename}`);
                    }
                } catch (error) {
                    utilites.debugError("Error in getting html content:", error);
                    // restartProcess(); // Restart the process in case of an error
                    process.exit(1);
                }

                // Scrape specific table
                const specificTableData = await scrapeSpecificTable(page);
                let container = {};
                let isContact = false;
                if (specificTableData) {
                    utilites.debug('Specific Table Data:');
                    utilites.debug('.. data collapsed (to see expanded data, remove comment at about line 257 from main function) ..'); // specificTableData);
                    var loHolder = "";
                    let founderHolder = [];
                    let isFounder = false;
                    for (let i = 0; i < specificTableData.length; i++) {
                        // console.log("HERE " + i);
                        let holder = [];
                        for (const [key, value] of Object.entries(specificTableData[i])) {
                            // console.log(`KEY:${key}\nVALUE:${value}`);
                            if (key.includes('ที่ตั้ง')) {
                                loHolder = key;
                            }
                            if (value.includes('ข้อมูลสำหรับการติดต่อ') || value.includes('ข้อมูลสำหรับติดต่อ')) {
                                isContact = true;
                            }
                            holder.push(value);
                        }
                        // console.log("HOLDER:", holder)
                        if (holder.length == 2 && holder[0] != "") {
                            // ignore 'ประกอบธุรกิจ': 'ประกอบกิจการเพาะปลูกพืชการเกษตร\n' +  'หมวดธุรกิจ : การปลูกพืชผักอื่นๆ ซึ่งมิได้จัดประเภทไว้ในที่อื่น',
                            if (holder[1].includes('หมวดธุรกิจ')) {
                                // console.log(holder[1]);
                                container["ประกอบธุรกิจ"] = holder[1].split('\n')[0];
                                if (holder[1].split('\n')[1] != undefined) {
                                    container["หมวดธุรกิจ"] = holder[1].split('\n')[1].replace('หมวดธุรกิจ : ', '');
                                }
                                continue;
                            }
                            container[holder[0]] = holder[1].split('\n')[0];
                        }
                        if (holder.length == 1 && holder[0] != "" && !isFounder && founderHolder.length <= 0) {
                            if (holder[0].includes('กรรมการ')) {
                                isFounder = true;
                                container["ก่อตั้งโดย"] = "กรรมการ";
                                continue;
                            }
                            if (holder[0].includes('หุ้นส่วน')) {
                                isFounder = true;
                                container["ก่อตั้งโดย"] = "หุ้นส่วน";
                                continue;
                            }
                        }
                        if (isFounder){
                            if (/^[0-9]/.test(holder[1])){
                                founderHolder.push(holder[1].split('. ')[1]);
                            }
                            else {
                                isFounder = false;
                            }
                        }
                    }
                    // console.log("FOUNDERHOLDER:", founderHolder);

                    // console.log(Object.keys(specificTableData[0])[0]);
                    var akey = Object.keys(specificTableData[0])[0];
                    container['ที่ตั้ง'] = akey.split('แผนที่')[1].trim().split('ค้นหาเบอร์โทร')[0].trim().split('\n')[0].split('\t')[0];
                    // console.log(container);
                    if (container["ก่อตั้งโดย"]){
                        container["ก่อตั้งโดย"] = (container["ก่อตั้งโดย"] + ": " + founderHolder.join(', ')).replace(/\n/g, " ").replace(/ /g, "");
                    }
                }
                else {
                    utilites.debugError("No table found with the specified text.");
                    utilites.debug("The token might be exceeded the limit, try to change the token.");
                    await closeConnection(browser);
                    utilites.notifyCompletion(
                        "Error Occured",
                        "No table found with the specified text.\nThe token might be exceeded the limit, try to change the token."
                    );
                    utilites.debug("Total companies that we got:", howManyThatWeGot);
                    utilites.debug("which the last try is at", companyIds.indexOf(companyId), "companies of", companyIds.length - 1, "companies from catalog id:", workingCatagoryId, "(", catagory['ประเภทธุรกิจ'], ")");
                    utilites.sleep(5);
                    process.exit(1);
                }

                // console.log(container)
                // console.log(container["หมวดธุรกิจ"])
                // console.log(!container["หมวดธุรกิจ"])
                
                if (!container["หมวดธุรกิจ"]){
                    container["หมวดธุรกิจ"] = container["ประกอบธุรกิจ"];
                    container["ประกอบธุรกิจ"] = "";
                }

                const h2Values = await scrapeH2(page);
                console.log(h2Values);
                container['ชื่อบริษัทภาษาอังกฤษ'] = h2Values[0].text;
                container['ชื่อบริษัทภาษาไทย'] = h2Values[1].text;
                container['ข้อมูลสำหรับการติดต่อ'] = isContact;
                container['ที่มา'] = url;
                if (container["ทะเบียน"] != undefined) {
                    container['เลขทะเบียน'] = container["ทะเบียน"];
                    container["ทะเบียน"] = undefined;
                }
                for (let key in Object.keys(container)) {
                    if (key.includes("\n")) {
                        utilites.debug("Ignoring key:", key);
                        container[key] = undefined;
                    }
                }

                await closeConnection(browser);

                utilites.debug("Writing data to file...");
                utilites.debug(container);
                utilites.appendJsonFile(targetDir + workingCatagoryId + '.json', container);
                
                howManyThatWeGot++;
                utilites.debug("This is the", howManyThatWeGot, "company from this round of scraping data.");

                utilites.debug("Sleeping for", delayTime, "seconds...");
                await utilites.sleep(delayTime);
            }
        }
        utilites.debug("Done");
        utilites.notifyCompletion(
            "Task Completed",
            "Done scraping data for all companies that defined in assigned folder"
        );
        utilites.debug("Total companies that we got:", howManyThatWeGot);
    } catch (error) {
        utilites.debug('Error in main function:', error);
    }
    try {
        await closeConnection(browser);
    }
    catch (error) {
        utilites.debug('Cannot finalize the browser:', error);
    }
})();
