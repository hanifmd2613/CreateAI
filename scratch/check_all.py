import os
import re

pattern = re.compile(r'create\s*ai|create-ai', re.IGNORECASE)
root_dir = r'c:\tempp\projects\CreatorMatch-AI'
matches = []

for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in ['.git', '.next', 'node_modules', 'tsconfig.tsbuildinfo', 'scratch']]
    for f in filenames:
        filepath = os.path.join(dirpath, f)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                for idx, line in enumerate(file, 1):
                    if pattern.search(line):
                        matches.append((os.path.relpath(filepath, root_dir), idx, line.strip()))
        except Exception as e:
            pass

print(f"Remaining occurrences count: {len(matches)}")
for rel, line, content in matches:
    print(f"{rel}:{line} -> {content}")
