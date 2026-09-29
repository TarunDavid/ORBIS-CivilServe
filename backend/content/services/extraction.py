import os
import struct
from django.conf import settings
from content.models import Material, ExtractedChunk
from ai_engine.services import STTService, EmbeddingService

def float_array_to_blob(float_array) -> bytes:
    """Convert a list of floats to a binary blob for sqlite-vec."""
    return struct.pack(f"{len(float_array)}f", *float_array)

def process_material(material_id: int):
    """
    Background job to parse a material, extract text, and compute embeddings.
    """
    try:
        material = Material.objects.get(id=material_id)
        material.status = 'processing'
        material.save()

        file_path = material.file.path
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File missing: {file_path}")

        chunks_data = []

        if material.material_type == 'pdf':
            # Simulated PDF extraction for now.
            # In production, use PyPDF2 or pdfminer to extract text pages.
            text = f"Simulated extracted text from PDF {material.title}. This represents page 1."
            chunks_data.append({
                'content': text,
                'start_time': None,
                'end_time': None
            })
            
        elif material.material_type == 'video':
            # Transcribe with Whisper
            whisper_model = STTService.get_instance()
            # whisper_model.transcribe yields a generator of segments
            segments, info = whisper_model.transcribe(file_path, beam_size=5)
            
            for segment in segments:
                chunks_data.append({
                    'content': segment.text.strip(),
                    'start_time': segment.start,
                    'end_time': segment.end
                })
        
        # Embed and save
        embedder = EmbeddingService.get_instance()
        
        for idx, chunk in enumerate(chunks_data):
            if not chunk['content']:
                continue
                
            # Get 384-dimensional embedding from SentenceTransformer
            emb_vector = embedder.encode(chunk['content'])
            emb_blob = float_array_to_blob(emb_vector)
            
            ExtractedChunk.objects.create(
                material=material,
                content=chunk['content'],
                start_time=chunk['start_time'],
                end_time=chunk['end_time'],
                embedding_blob=emb_blob
            )

        material.status = 'ready'
        material.save()
        return f"Processed {len(chunks_data)} chunks."

    except Exception as e:
        if 'material' in locals():
            material.status = 'failed'
            material.save()
        print(f"Extraction failed for Material {material_id}: {e}")
        raise e
