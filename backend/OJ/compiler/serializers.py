from rest_framework import serializers
from problems.models import Submission

class ExecutionSerializer(serializers.Serializer):
    code = serializers.CharField()
    language = serializers.ChoiceField(choices=["cpp", "python"])
    input_data = serializers.CharField(allow_blank=True, required=False)



class SubmissionSerializer(serializers.ModelSerializer):
    problem_uuid = serializers.UUIDField(write_only=True)

    class Meta:
        model = Submission
        fields = ['code', 'language', 'problem_uuid']


class SubmissionDetailSerializer(serializers.ModelSerializer):
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    problem_uuid = serializers.UUIDField(source='problem.uuid', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'status', 'language', 'timestamp', 'time', 'memory', 'code', 'problem_title', 'problem_uuid', 'passed_cases', 'total_cases']

