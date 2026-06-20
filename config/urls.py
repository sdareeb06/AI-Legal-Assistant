from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from cases.views import FIRViewSet, EvidenceViewSet
from laws.views import LawViewSet
# Yahan mazeed koi import karne ki zaroorat nahi agar hum niche include use kar rahe hain

router = DefaultRouter()
router.register(r'firs', FIRViewSet)
router.register(r'evidence', EvidenceViewSet)
router.register(r'laws', LawViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # 🔥 Best Practice: Is tarah likhein taake ai_engine ki saari urls yahan connect ho jayen
    path('api/ai/', include('ai_engine.urls')), 
]