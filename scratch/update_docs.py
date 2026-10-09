import os
import re

root_dir = r'c:\tempp\projects\CreatorMatch-AI'
docs_dir = os.path.join(root_dir, 'docs')

doc_files = [os.path.join(docs_dir, f) for f in os.listdir(docs_dir) if f.endswith('.md')]

for filepath in doc_files:
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Replace local Windows file links
    # file:///c:/tempp/projects/CreatorMatch-AI/docs/ARCHITECTURE.md -> docs/ARCHITECTURE.md
    # file:///c:/tempp/projects/CreatorMatch-AI/firestore.rules -> firestore.rules
    content = re.sub(
        r'file:\/\/\/[c|C]:\/tempp\/projects\/CreatorMatch-AI\/?',
        '',
        content
    )
    content = re.sub(
        r'c:\\tempp\\projects\\CreatorMatch-AI',
        'GenCraft Repository',
        content,
        flags=re.IGNORECASE
    )

    # Replace CreateAI branding and identifiers
    content = re.sub(r'CreateAI Neural Synthesis Engine', 'GenCraft Neural Synthesis Engine', content)
    content = re.sub(r'CreateAI Neural Engine', 'GenCraft Neural Engine', content)
    content = re.sub(r'CreateAI Local Synthesizer', 'GenCraft Local Synthesizer', content)
    content = re.sub(r'CreateAI Authors', 'GenCraft Authors', content)
    content = re.sub(r'createai-marketplace', 'gencraft-marketplace', content)
    content = re.sub(r'createai_is_authenticated', 'gencraft_is_authenticated', content)
    content = re.sub(r'createai_current_user', 'gencraft_current_user', content)
    content = re.sub(r'CreateAI', 'GenCraft', content)
    content = re.sub(r'Create AI', 'GenCraft', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated all docs markdown files successfully.")
