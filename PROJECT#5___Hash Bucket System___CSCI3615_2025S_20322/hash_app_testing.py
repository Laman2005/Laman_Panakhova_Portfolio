import os
import subprocess
import random
import string
import xxhash
import shutil

def generate_random_inputs(count, min_len=5, max_len=12):
    return [
        ''.join(random.choices(string.ascii_letters + string.digits, k=random.randint(min_len, max_len)))
        for _ in range(count)
    ]

def run_hash_app(n, s, inputs):
    print(f"\nRunning hash_app.py with {n} buckets and size {s}...")
    process = subprocess.Popen(
        ["python", "hash_app.py", str(n), str(s)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    for input_str in inputs:
        process.stdin.write(input_str + "\n")
    process.stdin.close()
    process.wait()

    out = process.stdout.read()
    err = process.stderr.read()
    return out, err

def validate_buckets(n, s, inputs):
    hash_map = {}
    for string in inputs:
        bucket = (xxhash.xxh32(string).intdigest() % n) + 1
        hash_map.setdefault(bucket, []).append(string)

    success = True
    for bucket_index, expected in hash_map.items():
        files = []
        base = os.path.join("buckets", f"{bucket_index}.txt")
        if os.path.exists(base):
            files.append(base)

        i = 1
        while os.path.exists(os.path.join("overflows", f"{bucket_index}_overflow{i}.txt")):
            files.append(os.path.join("overflows", f"{bucket_index}_overflow{i}.txt"))
            i += 1

        found = []
        for f in files:
            with open(f, "r", encoding="utf-8") as file:
                content = file.read().strip()
                if content:
                    found += content.split(",")

        for val in expected:
            if val not in found:
                print(f"Error: '{val}' missing in bucket {bucket_index}")
                success = False

    if success:
        print("All inputs correctly placed into buckets and overflow.")
    else:
        print("Some inputs were misplaced or missing.")

if __name__ == "__main__":
    # Clean previous output
    if os.path.exists("buckets"):
        shutil.rmtree("buckets")
    if os.path.exists("overflows"):
        shutil.rmtree("overflows")

    num_inputs = random.randint(25, 40)
    num_buckets = random.randint(3, 6)
    bucket_size = random.randint(15, 30)

    test_inputs = generate_random_inputs(num_inputs)

    out, err = run_hash_app(num_buckets, bucket_size, test_inputs)

    if out:
        print("Output:\n" + out)
    if err:
        print("STDERR:\n" + err)

    validate_buckets(num_buckets, bucket_size, test_inputs)
