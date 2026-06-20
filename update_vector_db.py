import os
import json
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer

# 1. Professional Legal Model Load Karo
print("Loading Legal-BERT... (Expert Lawyer Search Engine)")
model = SentenceTransformer('nlpaueb/legal-bert-base-uncased')

# 2. File Path (law.json)
JSON_PATH = 'law.json' 

if not os.path.exists(JSON_PATH):
    print(f"Error: {JSON_PATH} nahi mili! File check karo jani.")
else:
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        laws_data = json.load(f)

    # Agar laws_data list nahi hai (single object hai), to usay list mein convert karo
    if isinstance(laws_data, dict):
        laws_data = [laws_data]

    print(f"Total Laws found in JSON: {len(laws_data)}")

    # 3. Searchable Text Taiyar Karo (Using your 'topic' and 'text' keys)
    documents = []
    for item in laws_data:
        topic = item.get('topic', 'Untitled Law')
        content = item.get('text', item.get('summary', 'No Content available'))
        # Hum Topic aur Text dono ko mila kar index karenge taake search behtar ho
        documents.append(f"Topic: {topic} | Content: {content}")

    print(f"Indexing {len(documents)} laws. Thora wait karein, embedding ban rahi hai...")

    # 4. Generate Embeddings
    embeddings = model.encode(documents, show_progress_bar=True)

    # 5. Save to FAISS Index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype('float32'))

    # Folder banana aur files save karna
    os.makedirs('ai_models', exist_ok=True)
    faiss.write_index(index, 'ai_models/laws_index.faiss')
    
    with open('ai_models/laws_metadata.pkl', 'wb') as f:
        pickle.dump({'metadata': laws_data}, f)

    print("\nSuccess! Ab 22,000 laws Vector DB mein fit hain.")