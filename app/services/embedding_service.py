import numpy as np
from sentence_transformers import SentenceTransformer

# Load a fast local model for embeddings so we don't hit OpenRouter's rate limits/latency
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embeddings(chunks):
    # Sentence-transformers naturally batches and processes strings instantly on CPU
    embeddings = embedder.encode(chunks)
    return np.array(embeddings)

def embed_query(query: str):
    # Encode a single query and wrap in numpy array as expected
    embedding = embedder.encode([query])
    return np.array(embedding)