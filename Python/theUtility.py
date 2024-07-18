import os

def __init__(): print("theUtility.py is initialized")

def listDirTree(dirPath, basePath=None):

    print(f"theUtility[listDirTree]: Listing directory tree for {dirPath}")

    if basePath is None: basePath = dirPath
    listdir = []

    try:
        for root, dirs, files in os.walk(dirPath):
            for name in files + dirs:
                file_path = os.path.join(root, name)
                relative_path = os.path.relpath(file_path, basePath)
                listdir.append(os.path.join(dirPath, relative_path))
    except Exception as e:
        print(f'theUtility[listDirTree]: ERROR, cannot list directory tree for {dirPath}')
        print(e)
        return None

    return listdir

def deleteDir(dirPath):
    import shutil
    print(f"Deleting directory {dirPath}")
    try: shutil.rmtree(dirPath)
    except Exception as e:
        print(f'theUtility[deleteDir]: ERROR, cannot delete directory {dirPath}')
        print(e)

def selectValueFromOs(valueForWin, valueForLinux):
    import sys; return [valueForLinux, valueForWin][sys.platform == "win32"]

def cwd(): return os.getcwd()

def main(): print("theUtility.py is called as main, it should be imported as a module."); exit(1)
if __name__ == '__main__': main()
else: print("theUtility.py is imported as a module")

def readJson(filePath: str):
    import json
    try:
        with open(filePath, 'r') as file: data = json.load(file)
    except Exception as e:
        print(f'theUtility[readJson]: ERROR, cannot read json file {filePath}')
        print(e)
        return None
    return data

def writeJson(filePath: str, data: dict):
    import json
    try:
        with open(filePath, 'w') as file: json.dump(data, file, indent=4)
    except Exception as e:
        print(f'theUtility[writeJson]: ERROR, cannot write json file {filePath}')
        print(e)
        return None
    return data

def appendJson(filePath: str, data: dict):
    import json
    try:
        oldData = readJson(filePath)
        oldData.update(data)
        with open(filePath, 'w') as file: json.dump(oldData, file, indent=4)
    except Exception as e:
        print(f'theUtility[appendJson]: ERROR, cannot append json file {filePath}')
        print(e)
        return None
    return oldData

configPath = "config.json"
def getConfig(key: str = None, configPath: str = configPath):
    data = readJson(configPath)
    if data is None: return None
    if key is None: return data
    try: return data[key]
    except KeyError:
        print(f'theUtility[getConfig]: ERROR, key {key} is not found in {configPath}')
        return None

def update_nested_dict(d, keys, value):
    """
    Update a nested dictionary dynamically.
    
    :param d: The dictionary to update.
    :param keys: A tuple of keys indicating the nested path.
    :param value: The new value to set.
    """
    for key in keys[:-1]: d = d.setdefault(key, {})
    d[keys[-1]] = value

def updateConfig(keys: list, dataToUpdate: any, configPath: str = configPath):
    data = getConfig(configPath=configPath)
    if data is None: 
        print(f'theUtility[updateConfig]: ERROR, cannot update config file {configPath}')
        return None
    update_nested_dict(data, keys, dataToUpdate)
    return writeJson(configPath, data)
    
def cd(path: str):
    try: os.chdir(path)
    except Exception as e:
        print(f'theUtility[cd]: ERROR, cannot change directory to {path}')
        print(e)
        return None
    return cwd()

__version__ = '0.1.0'
__author__ = "OteEnded"