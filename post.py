import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

BASE_URL = "http://172.27.16.252:5210/api/users"
TOTAL_REQUESTS = 50000
MAX_WORKERS = 5   # keep this small on Windows first

payload_template = {
    # "idToken": "Firebase",
    "name": "hsdhd",
    "phoneNumber": "suih"
}

def make_session():
    session = requests.Session()

    retry = Retry(
        total=2,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST"]
    )

    adapter = HTTPAdapter(
        pool_connections=10,
        pool_maxsize=10,
        max_retries=retry
    )

    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def send_post(i, session):
    payload = {
        # "idToken": payload_template["idToken"],
        "name": f"hsdhd_{i}",
        "phoneNumber": f"900000{i:04d}"
    }

    try:
        r = session.post(BASE_URL, json=payload, timeout=10)
        return f"{i}: {r.status_code} -> {r.text}"
    except requests.exceptions.RequestException as e:
        return f"{i}: Error -> {e}"

def main():
    session = make_session()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(send_post, i, session) for i in range(1, TOTAL_REQUESTS + 1)]

        for future in as_completed(futures):
            print(future.result())
            time.sleep(0.05)  # tiny gap helps reduce churn

    session.close()

if __name__ == "__main__":
    main()