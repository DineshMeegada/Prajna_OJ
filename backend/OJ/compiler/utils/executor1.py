import subprocess
import os
import uuid
import threading
import psutil
import time
from pathlib import Path

# Define paths relative to the project base
BASE_DIR = Path(__file__).resolve().parent.parent.parent
TEMP_DIR = BASE_DIR / 'temp_codes'

# Ensure temp directory exists
TEMP_DIR.mkdir(exist_ok=True)

class ExecutionMonitor:
    """
    Helper class to monitor memory usage of a subprocess.
    Note: On Windows, precise memory limiting is hard without Job Objects.
    This is a 'soft' limit implementation for learning purposes.
    """
    def __init__(self, pid, memory_limit_mb):
        self.pid = pid
        self.memory_limit_mb = memory_limit_mb
        self.exceeded = False
        self.stop_event = threading.Event()

    def monitor(self):
        try:
            process = psutil.Process(self.pid)
            while not self.stop_event.is_set():
                # Check memory usage (RSS - Resident Set Size)
                mem_usage = process.memory_info().rss / (1024 * 1024) # Convert to MB
                if mem_usage > self.memory_limit_mb:
                    self.exceeded = True
                    process.kill() # Kill the process immediately
                    return
                time.sleep(0.01) # Check every 10ms
        except psutil.NoSuchProcess:
            pass # Process finished before we could check

def run_code(code, language, input_data, time_limit=2, memory_limit=100):
    """
    Executes code and returns the output or error.
    time_limit: seconds
    memory_limit: MB
    """
    unique_id = uuid.uuid4().hex
    
    # File Setup based on language
    if language == "cpp":
        filename = f"{unique_id}.cpp"
        exe_name = f"{unique_id}.exe"
        compile_cmd = ["g++", str(TEMP_DIR / filename), "-o", str(TEMP_DIR / exe_name)]
        run_cmd = [str(TEMP_DIR / exe_name)]
    elif language == "python":
        filename = f"{unique_id}.py"
        run_cmd = ["python", str(TEMP_DIR / filename)]
    else:
        return {"status": "Error", "output": "Unsupported Language"}

    file_path = TEMP_DIR / filename
    
    # Write code to file
    with open(file_path, "w") as f:
        f.write(code)

    try:
        # 1. Compilation (if C++)
        if language == "cpp":
            compile_proc = subprocess.run(
                compile_cmd, capture_output=True, text=True
            )
            if compile_proc.returncode != 0:
                return {"status": "Compilation Error", "output": compile_proc.stderr}

        # 2. Execution
        process = subprocess.Popen(
            run_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Start Memory Monitor Thread
        monitor = ExecutionMonitor(process.pid, memory_limit)
        monitor_thread = threading.Thread(target=monitor.monitor)
        monitor_thread.start()

        try:
            # Wait for process to finish with Time Limit
            stdout, stderr = process.communicate(input=input_data, timeout=time_limit)
            
            monitor.stop_event.set() # Stop monitoring
            monitor_thread.join()

            if monitor.exceeded:
                return {"status": "Memory Limit Exceeded", "output": ""}
            
            if process.returncode != 0:
                 return {"status": "Runtime Error", "output": stderr}
            
            return {"status": "Success", "output": stdout}

        except subprocess.TimeoutExpired:
            process.kill()
            monitor.stop_event.set()
            return {"status": "Time Limit Exceeded", "output": ""}

    except Exception as e:
        return {"status": "Internal Error", "output": str(e)}
    
    finally:
        # Cleanup: Delete created files
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            if language == "cpp" and os.path.exists(TEMP_DIR / exe_name):
                os.remove(TEMP_DIR / exe_name)
        except:
            pass