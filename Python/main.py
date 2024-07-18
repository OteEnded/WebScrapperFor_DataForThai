import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import theUtility
if theUtility.__author__ != "OteEnded": print("Error: theUtility module is not imported correctly."); exit(1)
if __name__ != "__main__": print("Error: main.py is not as the main module."); exit(1)

# print(f"Python main.py is called from {theUtility.cwd()}")

import pandas
import theUtility
import os
import webbrowser

print(f"Process's script called from {theUtility.cwd()}")
if os.path.exists(os.path.join(".","Python")): theUtility.cd(os.path.join(".","Python"))
print(f"Process's script working directory -> {theUtility.cwd()}")

user: str = input("Enter user name (Bew / Ote ?): ")

topic_file = "../BusinessCatagoryList.csv"
df_topic = pandas.read_csv(topic_file, dtype=str, encoding="utf-8")

if (len(user) < 1) or (theUtility.getConfig(user.lower()[0]) is None): print("Error: user is not found."); exit(1)
print(f"Hello, {user}.")
user = user.lower()[0]
working_scope = theUtility.getConfig(user)["scope"]
print(f"your working scope is {working_scope}")

def indexClosestToValue(mainList: list[int], value: int):
    return mainList.index(min(mainList, key= lambda x: abs(int(x) - int(value))))

def mapScopeSlicer(mainList: list, scope: tuple):
    firstIndex = indexClosestToValue(mainList, scope[0])
    lastIndex = indexClosestToValue(mainList, scope[1])
    return (firstIndex, lastIndex)

first_index, last_index = mapScopeSlicer([int(i) for i in df_topic["รหัส"].tolist()], working_scope)
df_topic = df_topic[first_index: last_index]
# print(df_topic)

scraped_files = theUtility.listDirTree(os.path.join("..", "Target"))
scraped_files = [(i.split(os.sep)[-1]).split(".")[0] for i in scraped_files]
# print(scraped_files)

available_scope = [i for i in df_topic["รหัส"].tolist() if i in scraped_files]

if len(available_scope) < 1: print("Error: no available scope. If something is wrong, please contact the developer."); exit(1)

print(f"available scope (scraped files): {available_scope[0]} - {available_scope[-1]}")

last_processed_catagory = available_scope[indexClosestToValue(available_scope, theUtility.getConfig(user)["lastProcess"]["catagoryID"])]
print(f"last processed catagory: {last_processed_catagory}")

stacking_result = os.path.join("..", "Result", f"result_{user}.csv")
if os.path.exists(stacking_result): stacking_result = pandas.read_csv(stacking_result, encoding="utf-8", dtype=str).fillna('')
else: stacking_result = pandas.DataFrame()

catagory_id = ""

print(f"appending data to result_{user}.csv from {last_processed_catagory} to {available_scope[-1]}")
for index, row in df_topic[(df_topic["รหัส"].tolist().index(last_processed_catagory) + [0,1][theUtility.getConfig(user)["lastProcess"]["catagoryID"] != "0"]): (df_topic["รหัส"].tolist().index(available_scope[-1]))].iterrows():
    catagory_id = row["รหัส"]
    catagory_name = row["ประเภทธุรกิจ"]
    print(f"Processing catagory -> {catagory_id}: {catagory_name}")

    processing_file = os.path.join("..", "Target", f"{catagory_id}.json")
    if not os.path.exists(processing_file): print(f"Error: {processing_file} is not found."); continue

    try: 
        df_converter = pandas.read_json(processing_file, encoding="utf-8", dtype=str)
        df_converter.to_csv(os.path.join("Temp", f"temp.csv"), index=False, encoding="utf-8")
        df_converter = pandas.read_csv(os.path.join("Temp", f"temp.csv"), encoding="utf-8", dtype=str).fillna('')
        df_converter['เลขทะเบียน'] = df_converter['เลขทะเบียน'].apply(lambda x: "'" + x if not x.startswith("'") else x)
        stacking_result = pandas.concat(objs=[stacking_result, df_converter], ignore_index=True)

        stacking_result = stacking_result.drop_duplicates(subset='เลขทะเบียน').fillna('')

        theUtility.updateConfig((user, "lastProcess", "catagoryID"), catagory_id)
    except Exception as e:
        print(f"Error: cannot process {processing_file}")
        print(e)

print("merged data and starting filtering")

stacking_result['เบอร์โทร'] = ""

stacking_result['ทุนจดทะเบียน'] = stacking_result['ทุนจดทะเบียน'].str.replace(',', '')
stacking_result['ทุนจดทะเบียน'] = stacking_result['ทุนจดทะเบียน'].str.replace(' บาท', '')
stacking_result['ทุนจดทะเบียน'] = pandas.to_numeric(stacking_result['ทุนจดทะเบียน'])
stacking_result = stacking_result[(stacking_result['ทุนจดทะเบียน'] >= 30000000)]
stacking_result['ทุนจดทะเบียน'] = stacking_result['ทุนจดทะเบียน'].astype(str)

stacking_result = stacking_result[stacking_result['สถานะ']=='ยังดำเนินกิจการอยู่']

stacking_result['เลขทะเบียน'] = stacking_result['เลขทะเบียน'].apply(lambda x: "'" + x if not x.startswith("'") else x)

stacking_result['วันที่จดทะเบียน(ชื่อเดือน)'] = stacking_result['วันที่จดทะเบียน']
month_dict = {
    ' มกราคม ': '/1/',
    ' กุมภาพันธ์ ': '/2/',
    ' มีนาคม ': '/3/',
    ' เมษายน ': '/4/',
    ' พฤษภาคม ': '/5/',
    ' มิถุนายน ': '/6/',
    ' กรกฎาคม ': '/7/',
    ' สิงหาคม ': '/8/',
    ' กันยายน ': '/9/',
    ' ตุลาคม ': '/10/',
    ' พฤศจิกายน ': '/11/',
    ' ธันวาคม ': '/12/'
}
for key, value in month_dict.items(): stacking_result['วันที่จดทะเบียน'] = stacking_result['วันที่จดทะเบียน'].str.replace(key, value)

stacking_result["ข้อมูลสำหรับการติดต่อ"] = stacking_result["ข้อมูลสำหรับติดต่อ"].str.startswith("ส")


stacking_result = stacking_result.reset_index(drop=True)
colunm_order = [
    "เลขทะเบียน","ชื่อบริษัทภาษาไทย","ชื่อบริษัทภาษาอังกฤษ","ประกอบธุรกิจ","หมวดธุรกิจ","ที่ตั้ง","สถานะ","วันที่จดทะเบียน","วันที่จดทะเบียน(ชื่อเดือน)","ทุนจดทะเบียน","ก่อตั้งโดย","ข้อมูลสำหรับติดต่อ","ข้อมูลสำหรับการติดต่อ","เบอร์โทร","Website","หลักทรัพย์","ที่มา",
]
stacking_result = stacking_result[colunm_order + [i for i in stacking_result.columns if i not in colunm_order]]
stacking_result.to_csv(os.path.join("..", "Result", f"result_{user}.csv"), index=False, encoding="utf-8")
catagory_id = catagory_id if catagory_id != "" else available_scope[-1]
theUtility.updateConfig((user, "lastProcess", "catagoryID"), catagory_id)

print(f"updated result_{user}.csv from {last_processed_catagory} to {catagory_id} with filtering and cleaning")
print("> Press enter to continue... (filling in the missing data process or q to quit) <")
if input("Press enter to continue... (q to quit)") == "q": exit(0)

# stacking_result

print("initializing the filling in process, loading the data...")
df_filling_in = pandas.read_csv(os.path.join("..", "Result", f"result_{user}.csv"), encoding="utf-8", dtype=str).fillna('')

last_cpmpany_id = theUtility.getConfig(user)["lastProcess"]["companyID"]
last_cpmpany_index = df_filling_in["เลขทะเบียน"].tolist().index(last_cpmpany_id) if last_cpmpany_id != "0" else 0
last_cpmpany_index = int(theUtility.getConfig(user)["lastProcess"]["index"])

company_id = ""
last_index = 0

print("> Do you want the program to auto open the browser for you? (y/N) <")
auto_open_link = input("Do you want the program to auto open the browser for you? (y/N): ").lower() == "y"

for index, row in df_filling_in[last_cpmpany_index + 1:].iterrows():
    last_index = int(index)
    company_id = row["เลขทะเบียน"]
    company_name = row["ชื่อบริษัทภาษาไทย"]
    company_name_eng = row["ชื่อบริษัทภาษาอังกฤษ"]
    print("=" * 50)
    print(f"[{index}] Company {company_id} -> {company_name} | {company_name_eng}")

    phone_number = row["เบอร์โทร"]
    website = row["Website"]
    website_a = row["เว็บไซต์"]
    address = row["ที่ตั้ง"]
    source = row["ที่มา"]

    print(f"- phone_number: {phone_number} \n- website: {website} {website_a} \n- address: {address} \n- source: {source}")

    if (phone_number != "") and (website != "" or website_a != "") and (address != "") and (source != ""): 
        print(f"This one has all the information, skipping...")
        print(row)
        continue
    else:
        if phone_number == "":
            print("> please fill in the phone number <")
            url = f"https://www.google.com/search?q={company_name.replace(' ', '+')}+ติดต่อ"
            if row["ข้อมูลสำหรับการติดต่อ"].startswith("t"):
                print("The record shows that there is phone number from the source, so try this...")
                print(source)
                if auto_open_link: webbrowser.open(source)
            else:
                if auto_open_link: webbrowser.open(url)
            print(url)
            phone_number = input("Enter phone number (b to stop): ")
            if phone_number.startswith("b"):
                print("== stop filling in ==")
                break
            # if phone_number.startswith("s"):
            #     print("skip phone number")
            #     phone_number = ""
            # elif phone_number == "":
            #     url = f"https://www.google.com/search?q={company_name_eng.replace(' ', '+')}+contact"
            #     print(url)
            #     # webbrowser.open(url)
            #     phone_number = input("Enter phone number: ")
            phone_number = phone_number.replace(" ", "").strip()
            df_filling_in.at[index, "เบอร์โทร"] = "'" + phone_number if phone_number != "" else ""
        if website == "":
            if website_a != "": website = website_a
            else:
                print("> please fillin the website <")
                url = f"https://www.google.com/search?q={company_name.replace(' ', '+')}"
                print(url)
                if auto_open_link: webbrowser.open(url)
                website = input("Enter website (b to stop): ")
                if website.startswith("b"):
                    print("== stop filling in ==")
                    break
                # if website.startswith("s"):
                #     print("skip website")
                #     website = ""
                # elif website == "":
                #     url = f"https://www.google.com/search?q={company_name_eng.replace(' ', '+')}"
                #     print(url)
                #     # webbrowser.open(url)
                #     website = input("Enter website: ")
                website = website.replace(" ", "").strip()
                df_filling_in.at[index, "Website"] = website
        if address == "":
            print("> please fillin the address <")
            url = f"https://www.google.com/search?q={company_name.replace(' ', '+')}+ที่ตั้ง"
            print(url)
            if auto_open_link: webbrowser.open(url)
            address = input("Enter address (b to stop): ")
            if address.startswith("b"):
                print("== stop filling in ==")
                break
            # if address.startswith("s"):
            #     print("skip address")
            #     address = ""
            # elif address == "":
            #     url = f"https://www.google.com/search?q={company_name_eng.replace(' ', '+')}+location"
            #     print(url)
            #     # webbrowser.open(url)
            #     address = input("Enter address: ")
            address = address.replace(" ", "").strip()
            df_filling_in.at[index, "ที่ตั้ง"] = address
    
    print("== Data have been filled in. Drafted to data frame. ==")

theUtility.updateConfig((user, "lastProcess", "companyID"), company_id)
theUtility.updateConfig((user, "lastProcess", "index"), last_index)

df_filling_in.to_csv(os.path.join("..", "Result", f"result_{user}.csv"), index=False, encoding="utf-8")