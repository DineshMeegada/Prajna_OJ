from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    class Roles(models.TextChoices):
        CODER = 'CODER', 'Coder'
        MASTER = 'MASTER', 'Master'
        ADMIN = 'ADMIN', 'Admin'

    role = models.CharField(max_length=10, choices=Roles.choices, default=Roles.CODER)
    email = models.EmailField(unique=True) 

    def __str__(self):
        return f"{self.username} - {self.role}"

class MasterAccessRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        HOLD = 'HOLD', 'On Hold'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='master_requests')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    request_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 

    def __str__(self):
        return f"{self.user.username} - {self.status}"