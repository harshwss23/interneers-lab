import subprocess
import sys
import os

def print_header(msg):
    print("=" * 60)
    print(msg.center(60))
    print("=" * 60)

def run_command(cmd, label):
    print(f"[*] Running {label}...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            print(f"[PASS] {label} completed successfully.")
            return True, result.stdout
        else:
            print(f"[FAIL] {label} failed with exit code {result.returncode}.")
            return False, result.stdout + "\n" + result.stderr
    except Exception as e:
        print(f"[ERROR] Could not run {label}: {str(e)}")
        return False, str(e)

def main():
    print_header("AUTOMATED REGRESSION CHECK")
    
    all_passed = True
    
    # 1. Run Parametrized Test Suite using pytest
    passed, output = run_command(["py", "-m", "pytest", "products/tests"], "Pytest Suite")
    if not passed:
        all_passed = False
        print("-" * 40)
        print(output)
        print("-" * 40)
    else:
        # Print summary line from django test output
        summary = [line for line in output.splitlines() if "Ran " in line and " tests in" in line]
        if summary:
            print(f"    -> {summary[0]}")

    # 2. Add more checks here if needed (e.g., linting, static analysis)
    
    print_header("FINAL SUMMARY")
    if all_passed:
        print("SUCCESS: No regressions detected. The codebase is stable.")
        sys.exit(0)
    else:
        print("FAILURE: Regressions detected! Please review the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
