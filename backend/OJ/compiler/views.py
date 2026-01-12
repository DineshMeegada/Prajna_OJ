from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from django.conf import settings
from django.utils import timezone
from .models import AIReviewUsage
from problems.models import Problem, Submission
from .serializers import ExecutionSerializer, SubmissionSerializer, SubmissionDetailSerializer
from .utils.tasks import execute_code_task, submit_code_task
from .utils.reviewer import get_ai_review

class ExecuteCodeView(APIView):
    def post(self, request):
        serializer = ExecutionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            code = data['code']
            language = data['language']
            input_data = data.get('input_data', '')

            task = execute_code_task.delay(code, language, input_data) 
            
            try:
                # Wait up to 5 seconds for the result
                result = task.get(timeout=5)
                return Response({"output": result})
            except Exception as e:
                return Response({"output": "Time Limit Exceeded"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmitCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SubmissionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = request.user

            try:
                problem = Problem.objects.get(uuid=data['problem_uuid'])

                # Create DB record
                submission = Submission.objects.create(
                    user=user,
                    problem=problem,
                    code=data['code'],
                    language=data['language'],
                    status='P'
                )

                submit_code_task.delay(submission.id)

                return Response({
                    "message": "Submission received",
                    "submission_id": submission.id,
                    "status": "Pending"
                }, status=status.HTTP_201_CREATED)
            
            except Problem.DoesNotExist:
                return Response({"message": "Problem not found"}, status=status.HTTP_404_NOT_FOUND)
            
            except Exception as e:
                return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmissionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id, user=request.user)
            serializer = SubmissionDetailSerializer(submission)
            return Response(serializer.data)
        except Submission.DoesNotExist:
            return Response({"message": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)

class SubmissionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionDetailSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        queryset = Submission.objects.filter(user=user).order_by('-timestamp')
        
        problem_uuid = self.request.query_params.get('problem_uuid')
        if problem_uuid:
            queryset = queryset.filter(problem__uuid=problem_uuid)
            
        return queryset

class ReviewCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        language = request.data.get('language')
        problem_uuid = request.data.get('problem_uuid')

        if not code or len(code) < 10:
            return Response({"error": "Code is too short to review."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check Rate Limit
        user = request.user
        remaining_requests = 3
        
        if problem_uuid:
             today = timezone.now().date()
             usage, created = AIReviewUsage.objects.get_or_create(
                 user=user, 
                 problem_uuid=problem_uuid, 
                 date=today
             )
             if usage.count >= 3:
                 return Response({
                     "review": f"### 🛑 Daily Limit Exceeded\nYou have used all 3 AI reviews for this problem today. Please try again tomorrow! \n\nkeep coding! 🚀"
                 }, status=status.HTTP_200_OK) # Returning 200 to display in the UI gracefully without error handling complexity on frontend
             
             remaining_requests = 3 - usage.count

        problem_title = "Unknown Problem"
        try:
            problem = Problem.objects.get(uuid=problem_uuid)
            problem_title = problem.title
        except :
            pass
        
        review = get_ai_review(code, language, problem_title)

        # Increment count if successful
        if problem_uuid and "System Error" not in review:
             usage.count += 1
             usage.save()
             remaining_requests = 3 - usage.count
        
        return Response({"review": review, "remaining_requests": remaining_requests}, status=status.HTTP_200_OK)