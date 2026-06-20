from django.contrib import admin
from .models import Law

@admin.register(Law)
class LawAdmin(admin.ModelAdmin):
    list_display = ('topic', 'source')
    search_fields = ('topic', 'summary', 'text')
    list_filter = ('source',)