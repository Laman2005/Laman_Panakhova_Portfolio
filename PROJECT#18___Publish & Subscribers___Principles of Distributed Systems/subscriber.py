from google.cloud import pubsub_v1
import os
import json
import re
import time

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
subscription_id = "logs-sub-lpanakhova16882"
rules_file = "rules.json"

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(project_id, subscription_id)

def load_rules():
    with open(rules_file) as f:
        return json.load(f)["subscribers"]

rules = load_rules()

def callback(message):
    data = json.loads(message.data.decode("utf-8"))
    for sub_id, patterns in rules.items():
        for rule in patterns:
            if data["level"] == rule["level"] and re.search(rule["pattern"], data["message"]):
                print(f"Subscriber {sub_id} matched:", data)
    message.ack()

# Dynamic reload every 10s
def run_subscriber():
    subscriber.subscribe(subscription_path, callback=callback)
    print("Listening for messages...")
    while True:
        global rules
        rules = load_rules()
        time.sleep(10)

run_subscriber()
