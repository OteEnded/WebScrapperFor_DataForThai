const utilites = require('./theUtility.js');

targetPath = "Target2/"

fileList = utilites.listDirTree(targetPath)
console.log(fileList);

// process.exit(0);


for (let i = 0; i < fileList.length; i++) {
    console.log(fileList[i]);
    temp = utilites.readJsonFile(targetPath + fileList[i]);
    for (let j = 0; j < temp.length; j++) {
        if(Object.keys(temp[j]).includes("ก่อตั้งโดย")){
            temp[j]["ก่อตั้งโดย"] = temp[j]["ก่อตั้งโดย"].replace(/\n/g, " ").replace(/ /g, "");
        }
        console.log(temp[j]);
    }
    utilites.writeJsonFile("./Temp/" + fileList[i], temp);
}