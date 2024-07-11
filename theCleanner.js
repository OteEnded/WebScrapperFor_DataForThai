const utilites = require('./theUtility.js');

fileList = utilites.listDirTree("./Target")

for (let i = 0; i < fileList.length; i++) {
    console.log(fileList[i]);
    temp = utilites.readJsonFile("./Target/" + fileList[i]);
    for (let j = 0; j < temp.length; j++) {
        if(Object.keys(temp[j]).includes("ก่อตั้งโดย")){
            temp[j]["ก่อตั้งโดย"] = temp[j]["ก่อตั้งโดย"].replace(/\n/g, " ").replace(/ /g, "");
        }
        console.log(temp[j]);
    }
    utilites.writeJsonFile("./Temp/" + fileList[i], temp);
}