# Project DataFillinginAndCleaning - Python

This subproject is responsible for data conversion, cleaning, and filling. It is part of a larger parent project that handles web scraping using JavaScript. The scraped data is stored in JSON format, which is often raw and unstructured. Our task is to process this data by filtering, cleaning, and filling in any missing information using Python and the Pandas library. The processed data is then saved as a CSV file in the parent's `Result` folder, ready for import into an Excel file for further analysis.

## How to Run This Subproject

1. Ensure you meet the parent project's requirements (Node.js) and have Python 3.9+ installed.
2. From the parent directory, run the main process file using:
	```bash
	npm run py
	```
3. Alternatively, you can run the process using Jupyter Notebook by opening and executing `theJupyterNotebook.ipynb` file.
4. Note: This project is a remake of an earlier project, and some data has already been filled from the original dataset. A migration script exists for this purpose, but it is not currently automated. Any updates from the original data will be manually migrated.

## Collaborators

The collaborators for this subproject are the same as those for [the parent project](../).

## Background

This subproject is a remake of [BJesaya](https://github.com/BJesaya)'s project (available at [DataForThai_jupyter](https://github.com/jesaya-tr/DataForThai_jupyter)). The original project was designed for macOS (Linux) and used Anaconda as the Python environment manager, which made it incompatible with other systems, particularly Windows. To address this, I set up a manual Python virtual environment to ensure cross-platform compatibility (Windows/macOS/Linux), although it has not been fully tested on macOS/Linux.

As I am relatively new to managing Python virtual environments, I welcome any suggestions or feedback. Feel free to reach out to me through any contact method provided.

---

<p style="font-size: 0.8em;">This README was written with the assistance of <a href="https://copilot.github.com/">GitHub Copilot</a>, an AI programming assistant.</p>