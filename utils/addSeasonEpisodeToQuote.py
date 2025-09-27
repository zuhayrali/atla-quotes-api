import os
import re
import json
import argparse
from rapidfuzz import fuzz

def extract_dialogue_text(file_path: str) -> str:
    """Extracts dialogue text from an SRT file, skipping timestamps and indices."""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    dialogue = [
        line.strip()
        for line in lines
        if line.strip()
        and not re.match(r'^\d+$', line)
        and not re.match(r'^\d{2}:\d{2}:\d{2},\d{3} -->', line)
    ]
    return " ".join(dialogue)

def extract_season_episode(filename: str):
    """Extracts season and episode numbers from a filename using the SXXEYY pattern."""
    match = re.search(r'S(\d{2})E(\d{2})', filename, re.IGNORECASE)
    if match:
        return int(match.group(1)), int(match.group(2))
    return None, None

def dynamic_threshold(quote: str) -> int:
    """Determines the fuzzy match threshold based on quote length."""
    length = len(quote)
    if length < 30:
        return 90
    elif length < 70:
        return 80
    elif length < 120:
        return 75
    else:
        return 70

def get_best_matching_file(quote: str, folder_path: str) -> tuple:
    """Returns the filename and best fuzzy match score for a quote among SRT files."""
    best_score = 0
    best_file = None
    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith('.srt'):
                full_path = os.path.join(root, file)
                full_dialogue = extract_dialogue_text(full_path)
                score = fuzz.token_set_ratio(quote.lower(), full_dialogue.lower())
                if score > best_score:
                    best_score = score
                    best_file = file
    return best_file, best_score

def process_quotes(quotes_path: str, folder_path: str):
    """Matches quotes to SRT files and adds season/episode info."""
    with open(quotes_path, 'r', encoding='utf-8') as f:
        quotes = json.load(f)

    for entry in quotes:
        quote = entry.get("quote", "")
        threshold = dynamic_threshold(quote)
        best_file, best_score = get_best_matching_file(quote, folder_path)

        if best_file and best_score >= threshold:
            season, episode = extract_season_episode(best_file)
            entry["season"] = season
            entry["episode"] = episode
        else:
            entry["season"] = None
            entry["episode"] = None

    with open(quotes_path, 'w', encoding='utf-8') as f:
        json.dump(quotes, f, indent=4)

def main():
    parser = argparse.ArgumentParser(description='Match quotes to subtitle files and add season/episode info.')
    parser.add_argument('folder_path', nargs='?', help='Path to the folder containing subtitle files')
    args = parser.parse_args()

    folder_path = args.folder_path or input("Enter the path to the folder: ").strip()
    quotes_path = 'quotes/quotes.json'

    if not os.path.exists(folder_path):
        print("The provided folder path does not exist.")
        exit(1)

    print(f"Processing folder: {folder_path}")
    process_quotes(quotes_path, folder_path)

if __name__ == "__main__":
    main()