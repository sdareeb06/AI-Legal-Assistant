from rest_framework import viewsets
from .models import Law
from .serializers import LawSerializer

class LawViewSet(viewsets.ModelViewSet):
    queryset = Law.objects.all()
    serializer_class = LawSerializer