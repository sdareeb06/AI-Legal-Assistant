from django.db import models
from django.conf import settings

class FIR(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    case_title = models.CharField(max_length=255)
    fir_document = models.FileField(upload_to='firs/') # PDF ya Image ke liye [cite: 67]
    extracted_text = models.TextField(blank=True, null=True) # OCR se nikla text [cite: 69]
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.case_title

class Evidence(models.Model):
    fir = models.ForeignKey(FIR, on_delete=models.CASCADE, related_name='evidence')
    evidence_file = models.FileField(upload_to='evidence/') # [cite: 70]
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Evidence for {self.fir.case_title}"