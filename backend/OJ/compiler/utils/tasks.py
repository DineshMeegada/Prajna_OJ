from celery import shared_task
from .executor import run_code_in_docker
from .judge import judge_submission
from problems.models import Submission, Problem

@shared_task
def execute_code_task(code, language, input_data):
    # This function runs inside the Celery Worker, NOT the Django server
    output = run_code_in_docker(code, language, input_data)
    return output

@shared_task
def submit_code_task(submission_id):
    try:
        submission = Submission.objects.get(id=submission_id)

        # Update status to Running
        submission.status = 'R'
        submission.save()

        # Get Problem UUID
        problem_uuid = str(submission.problem.uuid)

        # Call the Judge
        result = judge_submission(
            code = submission.code,
            language = submission.language,
            problem_uuid = problem_uuid
        )

        # Save Verdict
        submission.status = result['verdict']
        if 'passed_cases' in result and 'total_cases' in result:
            submission.passed_cases = result['passed_cases']
            submission.total_cases = result['total_cases']
        
        if 'time' in result:
            # Judge returns time in ms, DB/Frontend expects seconds (normally)
            # Frontend does: (sub.time * 1000).toFixed(0) ms
            # So we should store valid seconds.
            submission.time = float(result['time']) / 1000.0
            
        if 'memory' in result:
            submission.memory = result['memory']
            
        submission.save()

        return result
    
    except Submission.DoesNotExist:
        return {"verdict": "IE", "output": "Submission DB record missing"}
    except Exception as e:
        # Failsafe
        if 'submission' in locals():
            submission.status = 'IE'
            submission.save()
        return {"verdict": "IE", "output": str(e)}