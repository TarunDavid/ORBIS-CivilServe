import os
import struct
from typing import List
from django.conf import settings
from ai_engine.services import EmbeddingService

class RAGService:
    @staticmethod
    def retrieve_context(query: str, top_k: int = 3) -> str:
        """
        Embeds the query and uses sqlite-vec to find the nearest chunks
        from content_extractedchunk.
        """
        try:
            embedder = EmbeddingService.get_instance()
            query_embedding = embedder.encode(query).tolist()
            vector_bytes = struct.pack(f'{len(query_embedding)}f', *query_embedding)
            
            # Use sqlean directly for sqlite-vec as Django doesn't support the vec extension natively yet
            import sqlean
            import sqlite_vec
            
            db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
            db = sqlean.connect(db_path)
            db.enable_load_extension(True)
            sqlite_vec.load(db)
            
            cursor = db.cursor()
            
            # Since sqlite-vec requires a virtual table and we store raw blobs in ExtractedChunk,
            # we create an in-memory virtual table for the query, populate it quickly, and query it.
            # (In production, this would be a persistent virtual table synced via triggers)
            
            cursor.execute("DROP TABLE IF EXISTS temp.vec_search")
            cursor.execute("CREATE VIRTUAL TABLE temp.vec_search USING vec0(id INTEGER PRIMARY KEY, embedding float[384])")
            
            # Insert our blobs into the temp virtual table
            cursor.execute("""
                INSERT INTO temp.vec_search(id, embedding)
                SELECT id, embedding_blob FROM content_extractedchunk WHERE embedding_blob IS NOT NULL
            """)
            
            # Perform KNN
            cursor.execute("""
                SELECT chunk.content 
                FROM temp.vec_search vec
                JOIN content_extractedchunk chunk ON chunk.id = vec.id
                WHERE vec.embedding MATCH ?
                  AND k = ?
            """, (vector_bytes, top_k))
            
            results = cursor.fetchall()
            db.close()
            
            if not results:
                return "No relevant context found."
            
            context_parts = ["[Retrieved Context]:"]
            for idx, (text,) in enumerate(results):
                context_parts.append(f"--- Document {idx+1} ---\n{text}")
                
            return "\n\n".join(context_parts)
            
        except Exception as e:
            print(f"RAG retrieval failed: {e}")
            return "Context retrieval unavailable."
