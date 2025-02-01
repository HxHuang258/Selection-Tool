import time
from datetime import datetime, timedelta
# Python script to write a line to a new txt file
file_path = "output-test.txt"

# Write to the file
with open(file_path, "w") as file:
    file.write(f"This is a new line of text written by Github Actions at time: {datetime.now()}.\n")

print(f"Successfully wrote to {file_path}")
