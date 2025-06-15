import os
import re
import json
from rapidfuzz import fuzz
import argparse

json_path = 'quotes/quotes.json'  

parser = argparse.ArgumentParser(description='Process subtitle files in a given folder.')
parser.add_argument('folder_path', nargs='?', help='Path to the folder containing subtitle files')

args = parser.parse_args()

folder_path = args.folder_path or input("Enter the path to the folder: ").strip()

if not os.path.exists(folder_path):
    print("The provided folder path does not exist.")
    exit(1)

print(f"Processing folder: {folder_path}")


if not os.path.exists(folder_path):
    print("The provided folder path does not exist.")


def extract_dialogue_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    dialogue = []
    for line in lines:
        line = line.strip()
        if not line or re.match(r'^\d+$', line) or re.match(r'^\d{2}:\d{2}:\d{2},\d{3} -->', line):
            continue
        dialogue.append(line)
    
    return " ".join(dialogue)

def extract_season_episode(filename: str):
    match = re.search(r'S(\d{2})E(\d{2})', filename, re.IGNORECASE)
    if match:
        season = int(match.group(1))
        episode = int(match.group(2))
        return season, episode
    return None, None

def dynamic_threshold(quote: str) -> int:
    length = len(quote)
    if length < 30:
        return 90
    elif length < 70:
        return 80
    elif length < 120:
        return 75
    else:
        return 70

# Load quotes from JSON
with open(json_path, 'r', encoding='utf-8') as f:
    quotes = json.load(f)

# Loop and update entries
for entry in quotes:
    quote = entry["quote"]
    min_threshold = dynamic_threshold(quote)

    best_score = 0
    best_file = None

    for root, _, files in os.walk(folder_path):
        for file in files:
            if not file.endswith('.srt'):
                continue
            full_path = os.path.join(root, file)
            full_dialogue = extract_dialogue_text(full_path)

            score = fuzz.token_set_ratio(quote.lower(), full_dialogue.lower())
            if score > best_score:
                best_score = score
                best_file = file

    if best_score >= min_threshold and best_file:
        season, episode = extract_season_episode(best_file)
        if season and episode:
            entry["season"] = season
            entry["episode"] = episode
    else:
        entry["season"] = None
        entry["episode"] = None

# Write back to JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(quotes, f, indent=4)
