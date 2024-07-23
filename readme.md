# DataforthaiWebscrapperV2

This project is a web scraper program for a specific website called DataForThai (www.dataforthai.com). It is primarily written in JavaScript to make requests to the site, perform pre-indexing, and provide utility tools for this project. We also use Pandas in Python for further analysis and table editing.

## Collaborators

- [OteEnded](https://github.com/OteEnded) [Project Lead, JavaScript Development]
- [BJesaya](https://github.com/BJesaya) or [jesaya-tr](https://github.com/jesaya-tr) [Data Scientist, Data Analysis & Data Acquisition]

## How to Use This Project

Follow these steps to run this project:

1. Clone the repository: 
    ```
    git clone <repository_url>
    ```
2. Install Node.js (major version 18). You can download it from [here](https://nodejs.org/en/download/).
3. Navigate to the root of the project using the terminal:
    ```
    cd path_to_project
    ```
4. Install the necessary packages:
    ```
    npm install
    ```
5. Acquire a login token from [DataForThai](https://www.dataforthai.com/).
6. Rename the `.env-example.json` file to `.env.json` and replace the `value` key in the `cookie` object with your token.
7. Move the company ID list by category that you want to scrape from `./DataForThaiCompanyIdsByCategories` to `./Assigned`.
8. Run `main.js` or type in the terminal:
    ```
    npm start
    ```
9. Wait until the process is done. The results will be in the `./Target` directory as JSON files.
10. Import/convert the JSON files to your desired format. You can convert them to a DataFrame in pandas to process the data further.

## npm scripts

The project includes several npm scripts to help manage and run different parts of the project:

- **`npm start`**: This is the classic start script. It calls the `main.js` script to start the web scraping process.
- **`npm run report`** or **`npm run count`**: This script reads the target, the result, or anything that can calculate the progress and reports how much progress the project has made.
- **`npm run py`**: This script starts [the Python subproject part](./Python/), which handles data filtering, cleaning, and filling in. The script manages the Python virtual environment cross-platform (not fully tested on Mac/Linux).
- **`npm run pg`**: This script runs your own test script (`thePlayGround.js`) to test various things.

## Story of the Project

### Background

This is actually the V2 of the project. We were almost done with the last step of pulling the data we needed, but the journey was not that easy. The website we were trying to pull the data from was more complicated than we thought. The data structure was not clearly sorted out and had some conflicts in a few groups of data. So, we had to replan our project. Since everything was not going along with the first, second, or even the last plan from the V1 project, it almost felt like we had to fix everything we did, everything we coded. So, we decided to start a new one from the beginning again, and that became this V2 project as you see in this repo. I hope you, the one who got into this repo and is interested, can make good use of this study case of ours. Thank you for your interest.

### Challenges, Solutions, and the Workflow of Our Project

As you knew that this is a V2 project (as I mentioned in the above topic), what problem were we facing exactly? 

Initially, we observed that there were 20 business topics listed out in the top search bar. We decided to use these business topics as the top group of categories. In each topic, when clicked, it would display many business categories and within those categories, a list of businesses. For the business details, you would have to click on a row of the business list. So, we planned to set up the structure to be Topic -> Category -> Business. 

However, the reality was not as we had anticipated. The categories in each topic were not unique and there were many intersecting categories in different topics. Some topics even had almost the same meaning. When we realized this, it was pretty late. I had already written scripts to work with that structure, scripts to index, read, save data, and more. 

This led us to the decision to remake the project because of that problem, it felt like I had to restructure and fix almost everything. But that's fine, I count that as an experience. So, when I started making the V2, I worked pretty fast on it. Yes, I know that that problem is mostly on us. But that is not the only problem I faced. That is just one that made me decide to start over.

There were many website-related problems that we encountered (I mean the website doesn't have problems for general users, but it happened to us, who were trying to scrape data from it). 

For the scraping process (V2), I designed it as follows:

1. I designed the structure of how we store the pending work, the outputs, and the index for the program to lookup. Since we couldn't use the topics (20 of them) as the top grouping because of the problem mentioned earlier, it was harder to partition the work. The categories, which used to be the inner group, totalled over a thousand. For that amount, it was challenging to divide and assign work between the two of us (workers of this project). But that was unfortunate and we had to accept that. In the end, the structure was FolderToHoldResult -> Category -> Data.

2. Once the structure was set, we had to do the indexing. Let's go through the process of how to get data from this website. We went to the list of categories, which was a long page with over a thousand rows in a table. Then we got into a category and saw a list of businesses in that category. Some categories had many businesses, some had few, and by many, I mean over ten thousand companies. Since the website divided these company lists into pages with 400 rows per page, we just looped through those pages and got the company list. (It wasn't that easy, as you'll see later).

3. After indexing, we could start writing a script to read the index and scrape the real data that we needed!

Those were the three main steps to work out this project. 

Let's go through what we were dealing with and what we did. 

In the first step, I mentioned the problem so let's skip it. 

In the second step, to index our list of work, the data list we needed to get, we used pandas (Python) to read a URL to HTML and filter a target table to DataFrame and scrape it, listing out every link it went to. We got category IDs that we could use to append after "/business/objective/" + ID to get the company list pages from every category. That's when we faced problems. First, the website would only show a few items in the list if you were not a logged-in registered user. When we used pandas to go through URLs, it didn't count as a logged-in user and it did not show everything to pandas as it would to a logged-in user. So, I had to find out how this website authenticated a user, and found that it used a cookie that contained a token of session or user or something that could be used to send it along with the URL request to trick the website into thinking that pandas was requesting from a registered user. You can see this in the main code (JS) (but I didn't put the token in the code that was pushed to GitHub) and it worked!

We used the login token to access all data that a logged-in user can see. We noticed that some categories had a significantly larger number of companies, sometimes so large that the website separated these long lists into pages, with a maximum of 400 rows per page. It wasn't too difficult, we just had to find a way to navigate through every page if there were more than one, add that to the URL, "/business/objective/{objectiveID}/{pageNumber}". But how should we know how many pages to go through so we knew what number to put in a loop? 

The loop was, we had the table that contained [objectiveID, objectiveName(categoryName), amountOfCompanyForTheObjective], for each (i) category in the table, for j in range(amountOfCompany), and append the i, j value to the route(URL), and scrape those tables in the URL out (that are tables of the list of companies in the category). Then we should have every company on the web... right? No, and that is another problem that we faced. This website can't just use URL to page to get the page, if we just use the URL like "/business/objective/01450/2" to get to page 2, the web will just get us page 1 of that category like we just use "/business/objective/01450". 

I was lucky that I wanted Bew (my collaborator) to try using the data that we were pulling to process to the next step (we were working in waterfall but our boss wanted to see some result so I had to change the process to agile) and she found out that the data from any other page then page 1, had the same data as page 1. The loop logic wasn't working as expected, it went for about 1/4 of this process. So we had to start over, and find a new way to get data from pages higher than 1. 

The solution I figured out was to use a Chrome extension called "Save page WE" that allowed us to download a web page as we see it. Thanks to that, we could continue downloading every page on the web. And that's the way that we used to get a list of every company on this web, then we had to find a way to get company details. 

A way to get company detail? It shouldn't be that hard... right? We already had a table of the list of companies from every category that contained [companyName, companyID], just use companyIDs to append to "/company/{companyID}" URL and pull out things from that page. Yeah, that sounded easy, I tried that, and it didn't work as expected (again). 

The first problem here is the page that shows company detail has tables that contain data that we need, and the table is recursive, there are tables and tables in tables and tables, and every table is just \<table> that has no way to identify, no id, no class, nothing, and that's not friendly with pandas. Pandas can't scrape and convert web's table to dataframe if it's recursive and has no way to identify (it might be a way but we couldn't find it), so I had to write a JS to manually analyze the structure of the page and see the pattern of where data we need can be pulled out. 

I took some time until I got a custom code that can extract out the needed data, and I wrote a full function to loop through pages of company detail from the list of companyIds, and that's it, it's done... not really... It wasn't working, and that's another problem here. CompanyIds in the table from the list of companies in the category page is not the real ids, it's some kind of encryption or something that changes the id to be not real, it can't be used to append to "company/{id}" to get to the detail page of that company. 

Even if I inspect the page HTML and see that it uses the company id to navigate to the company detail page..., wait, it uses some kind of function to navigate instead, the function takes companyId and companyName? as arguments and then navigates, then what does the function do exactly? I tried to read and understand how it works and see that there is a string manipulating thing that plays with companyId before navigating and I cracked the algorithm of how it works and used that to decode the company id before using it in the URL to get to the company detail page. (I can't show the original function here but you can find how it works at decodeCompanyID function in theUtility). 

Let's get to the next process. I used JS to loop through the list of company id list and decode id and get to URL then scrap data from the company detail page, group it by company category and export data to JSON file that named by category id to the target folder. Then, use import JSON to Pandas dataframe to process further, filter, group, export to Excel. And that's it, the brief process of what we did, thanks for being interested and reading this long story. I hope you can make use of it.

---

<p style="font-size: 0.8em;">This README was written with the assistance of <a href="https://copilot.github.com/">GitHub Copilot</a>, an AI programming assistant.</p>