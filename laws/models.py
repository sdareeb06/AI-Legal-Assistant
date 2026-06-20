from django.db import models

class Law(models.Model):
    topic = models.CharField(max_length=500, null=True, blank=True)
    source = models.CharField(max_length=255, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    text = models.TextField()

    def __str__(self):
        return self.topic if self.topic else self.source