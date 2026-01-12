#!/bin/bash

# Pub/Sub Setup & Teardown Script

ID="lpanakhova16882"
PROJECT=$(gcloud config get-value project)

TOPICS=(INFO WARN DEBUG ERROR ALERT)
SUBSCRIBERS=(0 1 2 3)

if [ "$1" == "setup" ]; then
  echo "Creating topics..."
  for t in "${TOPICS[@]}"; do
    gcloud pubsub topics create ${t}-${ID}
  done

  echo "Creating subscriptions..."
  for s in "${SUBSCRIBERS[@]}"; do
    for t in "${TOPICS[@]}"; do
      gcloud pubsub subscriptions create sub${s}-${ID}-${t} \
        --topic=${t}-${ID}
    done
  done

  echo "Setup completed successfully."
fi

if [ "$1" == "teardown" ]; then
  echo "Deleting subscriptions..."
  for s in "${SUBSCRIBERS[@]}"; do
    for t in "${TOPICS[@]}"; do
      gcloud pubsub subscriptions delete sub${s}-${ID}-${t} --quiet
    done
  done

  echo "Deleting topics..."
  for t in "${TOPICS[@]}"; do
    gcloud pubsub topics delete ${t}-${ID} --quiet
  done

  echo "Teardown completed successfully."
fi
