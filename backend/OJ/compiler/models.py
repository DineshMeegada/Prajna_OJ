from django.db import models
from django.conf import settings

# Create your models here.
class AIReviewUsage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    problem_uuid = models.UUIDField()
    date = models.DateField(auto_now_add=True)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'problem_uuid', 'date')
