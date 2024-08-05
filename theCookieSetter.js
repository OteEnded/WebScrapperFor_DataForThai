const utilites = require('./theUtility.js');

x = utilites.parseProcessArgs(process.argv, ["token"]);

envData = utilites.getEnv();
envData["cookie"]["value"] = x.parsed["token"];

console.log(envData);

utilites.writeJsonFile(".env.json", envData);