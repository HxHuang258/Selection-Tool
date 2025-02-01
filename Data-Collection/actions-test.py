from datetime import datetime
import os

# Get the absolute path to the GitHub Actions workspace root
file_path = "Data-Collection/output.txt"

# Write the file
with open(file_path, "w") as file:
    file.write(f"This is a new line of text written by GitHub Actions at {datetime.now()}.\n")

print(f"✅ Successfully wrote to {file_path}")
