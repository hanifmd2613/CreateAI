import os
import re

root_dir = r'c:\tempp\projects\CreatorMatch-AI'
doc_files = ['README.md'] + [os.path.join('docs', f) for f in os.listdir(os.path.join(root_dir, 'docs')) if f.endswith('.md')]

win_link_pattern = re.compile(r'(c:[\\/][^\s\)\"\']+|file:\/\/\/[c|C]:[^\s\)\"\']+)', re.IGNORECASE)
createai_pattern = re.compile(r'create\s*ai|create-ai', re.IGNORECASE)

with open('scratch/docs_audit.txt', 'w', encoding='utf-8') as out:
    for rel in doc_files:
        full_path = os.path.join(root_dir, rel)
        if not os.path.exists(full_path): continue
        out.write(f"\n=== {rel} ===\n")
        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
            for idx, line in enumerate(f, 1):
                if win_link_pattern.search(line):
                    out.write(f'Line {idx} [WinPath] -> {line.strip()}\n')
                if createai_pattern.search(line):
                    out.write(f'Line {idx} [CreateAI] -> {line.strip()}\n')

print("Wrote docs audit to scratch/docs_audit.txt")
