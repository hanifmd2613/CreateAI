import json

with open('scratch/all_matches.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('scratch/matches_summary.txt', 'w', encoding='utf-8') as out:
    current_file = None
    for d in data:
        if d['file'] != current_file:
            current_file = d['file']
            out.write(f"\n=== {current_file} ===\n")
        out.write(f"Line {d['line']}: {d['content']}\n")

print("Written to scratch/matches_summary.txt successfully.")
