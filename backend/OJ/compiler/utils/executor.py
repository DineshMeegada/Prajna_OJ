import docker
import os
import io
import time
import shutil
import json
from pathlib import Path
from requests.exceptions import ReadTimeout, ConnectionError

# --- Configuration ---
DOCKER_IMAGE = "online-judge-env"
TIMEOUT = 5  # Seconds for execution limit
MEMORY_LIMIT = "256m" 

# BASE_DIR: D:\AlgoU\Prajna_OJ\backend\OJ\
BASE_DIR = Path(__file__).resolve().parent.parent.parent
# HOST_OJ_ROOT: The path to the OJ directory on the HOST machine.
HOST_OJ_ROOT = os.environ.get('HOST_OJ_ROOT', str(BASE_DIR))

TEMP_CODE_DIR = BASE_DIR / 'temp_codes'
TEMP_CODE_DIR.mkdir(exist_ok=True, parents=True)

# Initialize the Docker client
try:
    client = docker.from_env()
except Exception as e:
    print(f"FATAL: Docker client initialization failed. Is Docker Desktop running? Error: {e}")
    client = None

def run_code_in_docker(code: str, language: str, input_data: str = "") -> dict:
    """
    Executes user code inside a secure Docker container.
    """
    if client is None:
        return {"status": "Internal Error", "output": "Docker service unavailable."}

    unique_id = os.urandom(16).hex()
    
    # 1. Setup Host Environment (Temporary file naming)
    if language in ["python", "py"]:
        host_filename = f"{unique_id}.py"
        host_input_filename = f"{unique_id}.txt"
        container_run_command = f'/bin/sh -c "python3 /app/{host_filename} < /app/{host_input_filename}"'
    elif language in ["cpp", "c++"]:
        host_filename = f"{unique_id}.cpp"
        host_input_filename = f"{unique_id}.txt"
        # Compile and execute
        # Note: We must compile to a location writable by the user (like /tmp)
        compile_command = f'g++ -std=c++17 -O2 /app/{host_filename} -o /tmp/a.out'
        container_run_command = f'/bin/sh -c "{compile_command} && /tmp/a.out < /app/{host_input_filename}"'
    else:
        return {"status": "Error", "output": "Unsupported Language"}

    host_file_path = TEMP_CODE_DIR / host_filename
    host_input_file_path = TEMP_CODE_DIR / host_input_filename
    
    # 2. Write Code and Input to Host Files
    try:
        with open(host_file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        
        with open(host_input_file_path, 'w', encoding='utf-8') as f:
            f.write(input_data)
    except IOError:
        return {"status": "Internal Error", "output": "Could not write temporary file."}

    container = None
    try:
        start_time = time.time()

        container = client.containers.run(
            image = DOCKER_IMAGE,
            command = container_run_command,
            volumes = {
                # Map HOST path -> Container path
                f"{HOST_OJ_ROOT}/temp_codes": {'bind': '/app', 'mode': 'ro'}
            },
            working_dir = '/app',
            network_disabled = True,
            mem_limit = MEMORY_LIMIT,
            cpu_quota = 50000,
            detach = True
        )
        
        try :
            result = container.wait(timeout=TIMEOUT)
            execution_time = (time.time() - start_time) * 1000
            
            output = container.logs().decode('utf-8').strip()
            exit_code = result.get('StatusCode', 1)

            if exit_code != 0:
                if language in ["cpp", "c++"] and "error" in output.lower():
                    return {"status": "Compilation Error", "output": output}
                
                return {"status": "Runtime Error", "output": output}
            
            return {"status": "Success", "output": output, "time_ms": round(execution_time, 2)}

        except (ReadTimeout, ConnectionError):
            # Handling TLE by killing the container
            try :
                container.kill()
            except:
                pass

            return {"status": "Time Limit Exceeded", "output": "Execution exceeded time limit."}    

    except docker.errors.ImageNotFound:
        return {"status": "Internal Error", "output": f"Docker image '{DOCKER_IMAGE}' not found. Did you build it?"}

    except docker.errors.APIError as e:
        return {"status": "Internal Error", "output": f"Docker API Error: {str(e)}"}
        
    except docker.errors.ContainerError:
        return {"status": "Time Limit Exceeded", "output": "Execution exceeded time limit."}
        
    except Exception as e:
        if "Command timed out" in str(e):
             return {"status": "Time Limit Exceeded", "output": "Execution exceeded time limit."}
             
        return {"status": "System Error", "output": f"An unexpected error occurred: {str(e)}"}

    finally:
        # Cleanup code file
        if host_file_path.exists():
            try:
                os.remove(host_file_path)
            except :
                pass
        
        # Cleanup input file
        if host_input_file_path.exists():
            try:
                os.remove(host_input_file_path)
            except:
                pass
        
        if container :
            try :
                container.remove(force=True)
            except :
                pass




def _run_compilation(language, file_name):
    # Helper to just compiler C++ code
    if language not in ["cpp", "c++"]:
        return {"status": "Success"}
    
    cmd = f"g++ -std=c++17 -O2 /app/{file_name} -o /tmp/{file_name.split('.')[0]}.out"

    try:
        container = client.containers.run(
            image = DOCKER_IMAGE,
            command = cmd,
            volumes = {
                f"{HOST_OJ_ROOT}/temp_codes": {'bind': '/app', 'mode': 'ro'}
            },
            network_disabled = True,
            mem_limit = MEMORY_LIMIT,
            cpu_quota = 50000,
            detach = True
        )

        res = container.wait(timeout=TIMEOUT)
        logs = container.logs().decode('utf-8')
        container.remove()

        if res['StatusCode'] != 0:
            return {"status": "Compilation Error", "output": logs}
        
        return {"status": "Success"}
    
    except Exception as e:
        return {"status": "System Error", "output": str(e)}

def _cleanup(path):
    try:
        if path.exists():
            os.remove(path)
    except :
        pass