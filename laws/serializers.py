from rest_framework import serializers
from .models import Law

class LawSerializer(serializers.ModelSerializer):
    class Meta:
        model = Law
        fields = '__all__'