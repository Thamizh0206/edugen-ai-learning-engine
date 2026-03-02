import faiss
import numpy as np

class VectorStore:
    def __init__(self, dimension: int):
        self.index = faiss.IndexFlatL2(dimension)
        self.text_chunks = []

    def add(self, embeddings: np.ndarray, chunks: list):
        self.index.add(embeddings)
        self.text_chunks.extend(chunks)

    def search(self, query_embedding: np.ndarray, top_k: int = 5):
        distances, indices = self.index.search(query_embedding, top_k)
        # Filter out invalid indices (FAISS returns -1 for empty/missing)
        valid_indices = [int(i) for i in indices[0] if i >= 0]
        return [self.text_chunks[i] for i in valid_indices]

    def search_indices(self, query_embedding: np.ndarray, top_k: int = 5):
        distances, indices = self.index.search(query_embedding, top_k)
        return [int(i) for i in indices[0] if i >= 0]