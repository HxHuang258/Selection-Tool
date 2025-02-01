from datetime import datetime
import os

# Define the file path inside the Data-Collection directory
base_dir = os.path.join(os.getenv("GITHUB_WORKSPACE", ""), "Data-Collection")
file_path = os.path.join(base_dir, "output.txt")

# Write the file
with open(file_path, "w") as file:
    file.write(f"This is a new line of text written by GitHub Actions at {datetime.now()}.\n")

print(f"✅ Successfully wrote to {file_path}")
