from google.cloud import pubsub_v1
import csv
import json
import os
import time

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
topic_id = "logs-topic-lpanakhova16882"

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_id)

# Read CSV
with open("logs.csv", newline="") as csvfile:
    reader = csv.DictReader(csvfile)
    print("CSV headers:", reader.fieldnames)

    while True:
        for row in reader:
            data = json.dumps(row).encode("utf-8")
            publisher.publish(topic_path, data)
            print("Published:", row)
            time.sleep(2)
        csvfile.seek(0)
        next(reader)  # skip header
