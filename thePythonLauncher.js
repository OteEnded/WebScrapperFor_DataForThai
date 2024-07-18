const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const utility = require('./theUtility.js');

const binOrScripts = utility.selectValueFromOs('Scripts', 'bin');
const targetPythonFile = 'main.py';
let subprocessRunResult = null;

// Step 1: Check if this script launched from 'Python' directory and change directory to it
console.log("thePythonLauncher: being launched from ->", process.cwd());
if (fs.existsSync('Python')) process.chdir('Python');
if (!fs.existsSync('main.py')) {
    console.error("thePythonLauncher: Error -> main.py not found in Python directory.");
    process.exit(1);
}

// Step 2: Check if 'venv' directory exists, if not, create venv
// Step 3: Verify if the virtual environment is good to go
function createVenv() {
    try {
        execSync(`${utility.selectValueFromOs("python", "python3")} -m venv venv`, { stdio: 'inherit' });
        console.log("thePythonLauncher[createVenv]: Virtual environment created successfully.");
    } catch (error) {
        console.error(`thePythonLauncher[createVenv]: Error occurred -> ${error}`);
        process.exit(1);
    }
}

function checkVenv() {
    if (fs.existsSync(path.join('venv', binOrScripts)) &&
        fs.existsSync(path.join('venv', binOrScripts, 'activate')) &&
        fs.existsSync(path.join('venv', 'pyvenv.cfg'))) {
        try {
            execSync(`${path.join('venv', binOrScripts, 'python')} --version`);
            return true;
        } catch (error) {
            return false;
        }
    }
    try {
        execSync(`${utility.selectValueFromOs("", "source ")}${path.join("venv", binOrScripts, 'activate')} && deactivate`, { stdio: 'inherit', shell: true });
    }
    catch (error) {
        console.error(`thePythonLauncher[checkVenv]: Error occurred -> ${error}`);
        return false;
    }
    return false;
}

if (!fs.existsSync('venv')) {
    createVenv();
} else {
    console.log("thePythonLauncher: venv folder already exists.");
    if (checkVenv()) {
        console.log("thePythonLauncher: Virtual environment is good to go.");
    } else {
        console.log("thePythonLauncher: Virtual environment is not good to go. Creating a new one.");
        utility.deleteDir('venv');
        createVenv();
    }
}

// Step 4: Check if there is requirement.txt file in the directory, do pip install -r requirement.txt if it exists
if (fs.existsSync('requirements.txt')) {
    console.log("thePythonLauncher: Installing requirements from requirements.txt");
    try {
        execSync(`${utility.selectValueFromOs("", "source ")}${path.join("venv", binOrScripts, 'activate')} && pip install -r requirements.txt`, { stdio: 'inherit', shell: true });
        console.log("thePythonLauncher: Requirements installed successfully.");
    } catch (error) {
        console.error(`thePythonLauncher: Error occurred -> ${error}`);
    }
}

// Step 5: Activate virtual environment and run main.py
if (!fs.existsSync(targetPythonFile)) {
    console.error("thePythonLauncher: Error -> main.py not found in Python directory.");
    process.exit(1);
}

const command = `${utility.selectValueFromOs("", "source ")}${path.join('venv', binOrScripts, 'activate')} && python ${targetPythonFile}`;
console.log(`thePythonLauncher: ### Activating virtual environment and running [${targetPythonFile}] . ###`);

const child = spawn(command, { shell: true, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' });

// Handle user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');

child.stdout.on('data', (data) => {
    process.stdout.write(data);
});

child.stderr.on('data', (data) => {
    process.stderr.write(data);
});

rl.on('line', (input) => {
    child.stdin.write(input + '\n');
    if (input.trim() === 'exit') {
        child.stdin.end();
    }
});

child.on('close', (code) => {
    if (code !== 0) {
        console.error(`\nthePythonLauncher: Launch command failed with return code ${code}`);
    } else {
        console.log("\nthePythonLauncher: Launch command executed successfully");
    }
    process.exit(code);
});
