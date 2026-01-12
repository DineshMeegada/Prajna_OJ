from rest_framework import serializers
from .models import Problem

class ProblemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ["id", "uuid", "title", "difficulty", "created_by", "created_at"]

class ProblemDetailSerializer(serializers.ModelSerializer):
    statement = serializers.CharField(read_only=True)

    class Meta:
        model = Problem
        fields = ["id", "uuid", "title", "difficulty", "created_by", "created_at", "statement"]