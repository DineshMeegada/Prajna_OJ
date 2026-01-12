from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

# class Users(models.Model):
#     user_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
#     name = models.CharField(max_length=200)
#     email = models.EmailField(unique=True)
#     pwd_hash = models.CharField(max_length=256)
#     is_admin = models.BooleanField(default=False)
#     is_master = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

class Problem(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=50)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='problems', default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Testcase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='testcases')
    input_file = models.FileField(upload_to='testcases/input')
    output_file = models.FileField(upload_to='testcases/output')
    is_sample = models.BooleanField(default=False)

    def __str__(self):
        return f"Testcase for problem '{self.problem.title}'"


class Submission(models.Model):
    STATUS_CHOICES = (
        ('P', 'Pending'),
        ('R', 'Running'),
        ('AC', 'Accepted'),
        ('WA', 'Wrong Answer'),
        ('TLE', 'Time Limit Exceeded'),
        ('MLE', 'Memory Limit Exceeded'),
        ('CE', 'Compile Error'),
        ('RE', 'Runtime Error'),
        ('IE', 'Internal Error'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField(default="No Code")
    language = models.CharField(max_length=50, default="Python")
    status = models.CharField(max_length=3, choices=STATUS_CHOICES, default='P')
    timestamp = models.DateTimeField(auto_now_add=True)
    time = models.FloatField(null=True, blank=True)
    memory = models.FloatField(null=True, blank=True)
    passed_cases = models.IntegerField(default=0)
    total_cases = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.problem.title} - {self.status}"