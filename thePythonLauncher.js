const { spawn } = require('child_process');
const path = require('path');
const utility = require('./theUtility.js');

const pythonFile = 'run.py';
let pythonPath = 'Python';
if (utility.isFileExists(pythonFile)) 
    pythonPath = pythonFile
else if (utility.isFileExists(path.join(pythonPath, pythonFile)))
    pythonPath = path.join(pythonPath, pythonFile)
else {
    console.error(utility.debug('Python file not found ->', pythonPath, pythonFile))
    process.exit(1)
}


// Determine the correct Python command based on the OS
const isWindows = process.platform === 'win32';
const pythonCommand = isWindows ? 'python' : 'python3';

// Run the Python script using the determined Python command
const command = `${pythonCommand} ${pythonPath}`;


// Spawn the Python script process
const child = spawn(`${pythonCommand}`, [`${pythonPath}`]);

// Handle standard output from the Python script
child.stdout.on('data', (data) => {
    utility.debug(`thePythonLauncher: Stdout -> ${data}`);
});

// Handle standard error output from the Python script
child.stderr.on('data', (data) => {
    console.error(utility.debug(`thePythonLauncher: Stderr -> ${data}`));
});

// Handle exit event of the Python script process
child.on('exit', (code) => {
    utility.debug(`thePythonLauncher: Child process exited with code ${code}`);
    process.exit(code);
});

// Handle user input to send to the Python script process
process.stdin.on('data', (data) => {
    child.stdin.write(data);
});

// Handle errors in the child process
child.on('error', (err) => {
    console.error('Failed to start subprocess.', err);
});