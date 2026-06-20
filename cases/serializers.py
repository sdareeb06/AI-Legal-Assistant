from rest_framework import serializers
from .models import FIR, Evidence

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = '__all__'

class FIRSerializer(serializers.ModelSerializer):
    evidence = EvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = FIR
        fields = ['id', 'user', 'case_title', 'fir_document', 'extracted_text', 'created_at', 'evidence']