import subprocess
import json

def follow_eve_log(path):
    process = subprocess.Popen(
        ["tail", "-F", path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    for line in process.stdout:
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue
