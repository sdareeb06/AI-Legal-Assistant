import os
import pickle
import faiss
import numpy as np
from django.core.management.base import BaseCommand
from laws.models import Law
from sentence_transformers import SentenceTransformer

class Command(BaseCommand):
    help = 'Naye VIP Laws ka Vector DB banana'

    def handle(self, *args, **kwargs):
        self.stdout.write("AI Model load ho raha hai...")
        model = SentenceTransformer('all-MiniLM-L6-v2')

        laws = Law.objects.all()
        all_chunks = []
        chunk_metadata = []

        for law in laws:
            # Naye data mein summary mojood hai jo AI ke liye best hai
            text_to_embed = f"Topic: {law.topic}\nSummary: {law.summary}\nText: {law.text}"
            all_chunks.append(text_to_embed)
            
            chunk_metadata.append({
                "topic": law.topic,
                "source": law.source,
                "summary": law.summary
            })

        if not all_chunks:
            self.stdout.write(self.style.ERROR("Koi text nahi mila!"))
            return

        self.stdout.write("Embeddings ban rahi hain...")
        embeddings = model.encode(all_chunks, show_progress_bar=True)

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(np.array(embeddings))

        os.makedirs('ai_models', exist_ok=True)
        faiss.write_index(index, 'ai_models/laws_index.faiss')

        with open('ai_models/laws_metadata.pkl', 'wb') as f:
            pickle.dump({'chunks': all_chunks, 'metadata': chunk_metadata}, f)

        self.stdout.write(self.style.SUCCESS('Zabardast! Naye VIP Data ka Vector Database ban gaya!'))