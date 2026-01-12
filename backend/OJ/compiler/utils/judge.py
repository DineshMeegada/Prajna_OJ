
import os
from pathlib import Path
from django.conf import settings
from .executor import run_code_in_docker

# BASE_DIR is now fetched from settings to be more robust


def judge_submission(code: str, language: str, problem_uuid: str) -> dict:
    """
    Executes code against ALL test cases for a specific problem.
    """
    # Define paths
    # Use settings.STATEMENTS_DIR which is absolute
    problem_dir = settings.STATEMENTS_DIR / problem_uuid / 'testcases'
    
    if not problem_dir.exists():
        return {
            "verdict": "IE", 
            "output": f"Problem directory not found: {problem_dir}",
            "passed_cases": 0,
            "total_cases": 0
        }
    
    # Get all input files
    # Get all input files
    input_files = sorted(list(problem_dir.glob("input_*.txt")))
    if not input_files:
        return {
            "verdict": "IE", 
            "output": "No test cases found.",
            "passed_cases": 0,
            "total_cases": 0
        }

    total_time = 0
    max_memory = 0
    
    
    total_cases = len(input_files)
    passed_cases = 0

    for i, input_file in enumerate(input_files):
        # Determine corresponding output file
        # Format: input_X.txt -> output_X.txt
        filename_parts = input_file.name.split('_') # ['input', '1.txt']
        if len(filename_parts) < 2:
             continue
        case_id = filename_parts[1]
        output_file = problem_dir / f"output_{case_id}"
        
        if not output_file.exists():
             return {
                 "verdict": "IE", 
                 "output": f"Missing output file for {input_file.name}",
                 "passed_cases": passed_cases,
                 "total_cases": total_cases
             }

        # Read input content
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                input_data = f.read().strip()
        except Exception as e:
            return {
                "verdict": "IE", 
                "output": f"Failed to read input file: {e}",
                "passed_cases": passed_cases,
                "total_cases": total_cases
            }

        # Read expected output content
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                expected_output = f.read().strip()
        except Exception as e:
            return {
                "verdict": "IE", 
                "output": f"Failed to read output file: {e}",
                "passed_cases": passed_cases,
                "total_cases": total_cases
            }

        # Run code
        # We reuse run_code_in_docker which handles container creation, execution, and cleanup
        result = run_code_in_docker(code, language, input_data)
        
        # Check execution status
        if result['status'] != 'Success':
            # Map executor status to Verdict
            status = result['status']
            if status == "Time Limit Exceeded":
                return {"verdict": "TLE", "output": result.get('output', 'Time Limit Exceeded'), "failed_case": case_id, "passed_cases": passed_cases, "total_cases": total_cases}
            elif status == "Compilation Error":
                return {"verdict": "CE", "output": result.get('output', 'Compilation Error'), "failed_case": case_id, "passed_cases": passed_cases, "total_cases": total_cases}
            elif status == "Runtime Error":
                return {"verdict": "RE", "output": result.get('output', 'Runtime Error'), "failed_case": case_id, "passed_cases": passed_cases, "total_cases": total_cases}
            else:
                 return {"verdict": "IE", "output": result.get('output', 'Internal Error'), "failed_case": case_id, "passed_cases": passed_cases, "total_cases": total_cases}

        # Compare Output
        actual_output = result['output'].strip()
        
        # Simple string comparison
        # (Could enhance to ignore trailing whitespace more aggressively if needed)
        if actual_output != expected_output:
             return {
                 "verdict": "WA", 
                 "output": f"Wrong Answer on case {case_id}.\nExpected: {expected_output}\nGot: {actual_output}",
                 "failed_case": case_id,
                 "passed_cases": passed_cases,
                 "total_cases": total_cases
             }
        
        # Passed this case
        passed_cases += 1
        
        # Accumulate stats (Executor returns time_ms)
        total_time += result.get('time_ms', 0)
        # Memory is not returned by simple executor yet, can add later
        
    return {
        "verdict": "AC",
        "time": total_time,
        "message": "All cases passed",
        "passed_cases": passed_cases,
        "total_cases": total_cases
    }
