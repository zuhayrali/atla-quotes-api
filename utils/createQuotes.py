import os
import json

# Define the folder path containing the text files
folder_path = 'quotes'

# Initialize an empty list to store quotes
quotes = []
n_quote = 1

# Iterate over each file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith('.txt'):
        # Extract the author's name from the filename
        author_name = filename[:-4]  # Remove the '.txt' extension
        
        # Open and read the contents of the text file
        with open(os.path.join(folder_path, filename), 'r', encoding='utf-8') as file:
            for n, line in enumerate(file, start=1):
                quote = line.strip()  # Strip leading/trailing whitespace
                
                # Append a dictionary containing the quote details to the list
                quotes.append({
                    "id": n_quote,
                    "author": author_name,
                    "quote": quote
                })
                n_quote+=1

# Define the path for the output JSON file
json_file_path = 'src/quotes.json'

# Write the list of quotes to a JSON file
with open(json_file_path, 'w', encoding='utf-8') as json_file:
    json.dump(quotes, json_file, indent=4)

print(f"Quotes have been successfully written to {json_file_path}")