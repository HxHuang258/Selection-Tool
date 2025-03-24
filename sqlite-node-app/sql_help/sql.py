import re

# Define the function to convert dd/mm/yyyy to yyyy-mm-dd
def convert_date_format(date_str):
    try:
        # Split the date into day, month, and year
        day, month, year = date_str.split('/')
        # Return the date in yyyy-mm-dd format
        return f"{year}-{month}-{day}"
    except ValueError:
        # If the date format is invalid, return the original string
        return date_str

# Read the original SQL file
with open('all_matches.sql', 'r') as file:
    sql_content = file.read()

# Regular expression to find all date values inside INSERT INTO statements
# It matches dates in the format dd/mm/yyyy (e.g., 27/01/2025)
date_pattern = re.compile(r"'(\d{2}/\d{2}/\d{4})'")

# Replace the dates with the converted format
updated_sql_content = date_pattern.sub(lambda match: f"'{convert_date_format(match.group(1))}'", sql_content)

# Write the updated SQL content to a new file
with open('updated_sql_script.sql', 'w') as file:
    file.write(updated_sql_content)

print("SQL script has been updated successfully!")
