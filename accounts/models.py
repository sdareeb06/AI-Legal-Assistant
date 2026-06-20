from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('victim', 'Victim'),
        ('student', 'Law Practicing Student'),
        ('general', 'General User'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='general')

    # Clash fix karne ke liye ye 2 fields add kiye hain:
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True
    )

    def __str__(self):
        return f"{self.username} - {self.role}"