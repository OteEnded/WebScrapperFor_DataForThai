import pandas as pd
import numpy as np
import os
import theUtility

print(f"Process's script called from {theUtility.cwd()}")
if os.path.exists(os.path.join(".","Python")): theUtility.cd(os.path.join(".","Python"))
print(f"Process's script working directory -> {theUtility.cwd()}")

for user in ["b", "o"]:

    # Read the CSV files into DataFrames
    main_df = pd.read_csv(os.path.join("..","Result", f"result_{user}.csv"), dtype=str)  # Ensure all columns are read as strings
    filler_df = pd.read_csv(os.path.join(".","Temp", f"FilterAndSearchData{['', '_ote'][user.startswith('0')]}.csv"), dtype=str)  # Ensure all columns are read as strings

    # Define columns to be checked and filled
    columns_to_fill = main_df.columns

    # Iterate over the rows of the main DataFrame
    for index, row in main_df.iterrows():
        company_id = row['เลขทะเบียน']
        
        # Check if the companyID exists in the filler DataFrame
        if company_id in filler_df['เลขทะเบียน'].values:
            filler_row = filler_df[filler_df['เลขทะเบียน'] == company_id].iloc[0]
            
            # Fill missing values in the main DataFrame
            for column in columns_to_fill:
                if pd.isna(row[column]) or row[column] in ["", "None", np.nan]:
                    if not pd.isna(filler_row[column]) and filler_row[column] not in ["", "None", np.nan]:
                        main_df.at[index, column] = filler_row[column]

    # Save the updated main DataFrame back to a CSV file
    main_df.to_csv(os.path.join("..","Result", f"result_{user}.csv"), index=False, encoding="utf-8")

print("== Migration completed successfully! ==")
