import os
import re
import json
import argparse
from rapidfuzz import fuzz
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.table import Table

console = Console()

def extract_dialogue_text(file_path: str) -> str:
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
    match = re.search(r'S(\d{2})E(\d{2})', filename, re.IGNORECASE)
    if match:
        return int(match.group(1)), int(match.group(2))
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

def get_best_matching_file(quote: str, folder_path: str) -> tuple:
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
    with open(quotes_path, 'r', encoding='utf-8') as f:
        quotes = json.load(f)

    matched = 0
    unmatched = 0

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TextColumn("({task.completed}/{task.total})"),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("Matching quotes...", total=len(quotes))

        for entry in quotes:
            quote = entry.get("quote", "")
            character = entry.get("character", "unknown").capitalize()
            threshold = dynamic_threshold(quote)
            best_file, best_score = get_best_matching_file(quote, folder_path)

            short_quote = quote if len(quote) <= 50 else quote[:47] + "..."

            if best_file and best_score >= threshold:
                season, episode = extract_season_episode(best_file)
                entry["season"] = season
                entry["episode"] = episode
                progress.console.print(
                    f"  [green]✓[/green] [bold]{character}[/bold] — \"{short_quote}\" "
                    f"[dim]→ S{season:02d}E{episode:02d} (score: {best_score})[/dim]"
                )
                matched += 1
            else:
                entry["season"] = None
                entry["episode"] = None
                progress.console.print(
                    f"  [red]✗[/red] [bold]{character}[/bold] — \"{short_quote}\" "
                    f"[dim](best score: {best_score}, threshold: {threshold})[/dim]"
                )
                unmatched += 1

            progress.advance(task)

    with open(quotes_path, 'w', encoding='utf-8') as f:
        json.dump(quotes, f, indent=4)

    summary = Table.grid(padding=(0, 2))
    summary.add_row(
        f"[green]Matched:[/green] {matched}",
        f"[red]Unmatched:[/red] {unmatched}",
        f"[dim]Total: {len(quotes)}[/dim]",
    )
    console.print()
    console.print(summary)

def main():
    parser = argparse.ArgumentParser(description='Match quotes to subtitle files and add season/episode info.')
    parser.add_argument('folder_path', nargs='?', help='Path to the folder containing subtitle files')
    args = parser.parse_args()

    folder_path = args.folder_path or input("Enter the path to the folder: ").strip()
    quotes_path = 'quotes/quotes.json'

    if not os.path.exists(folder_path):
        console.print("[red]The provided folder path does not exist.[/red]")
        exit(1)

    console.print(f"\n[bold]Processing folder:[/bold] {folder_path}\n")
    process_quotes(quotes_path, folder_path)

if __name__ == "__main__":
    main()
