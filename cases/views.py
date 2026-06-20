from rest_framework import viewsets
from .models import FIR, Evidence
from .serializers import FIRSerializer, EvidenceSerializer
from .utils import extract_text_from_image, extract_text_from_audio

class FIRViewSet(viewsets.ModelViewSet):
    queryset = FIR.objects.all()
    serializer_class = FIRSerializer

    def perform_create(self, serializer):
        fir_instance = serializer.save()
        
        if fir_instance.fir_document:
            file_path = fir_instance.fir_document.path
            
            # Agar file image hai
            if file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                fir_instance.extracted_text = extract_text_from_image(file_path)
            
            # Agar file audio hai
            elif file_path.lower().endswith(('.mp3', '.wav', '.m4a')):
                fir_instance.extracted_text = extract_text_from_audio(file_path)
                
            fir_instance.save()

class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer