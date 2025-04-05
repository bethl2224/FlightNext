#!/bin/bash

# Run create-user.js
echo "Running create-user.js..."
node fake-data/create-user.js

# Check if the first script ran successfully
if [ $? -eq 0 ]; then
  echo "create-user.js completed successfully."
else
  echo "create-user.js failed. Exiting."
  exit 1
fi

# Run create-hotel.js
echo "Running create-hotel.js..."
node fake-data/create-hotel.js

# Check if the second script ran successfully
if [ $? -eq 0 ]; then
  echo "create-hotel.js completed successfully."
else
  echo "create-hotel.js failed. Exiting."
  exit 1
fi

# Run create-room-type.js
echo "Running create-room-type.js..."
node fake-data/create-room-type.js

# Check if the third script ran successfully
if [ $? -eq 0 ]; then
  echo "create-room-type.js completed successfully."
else
  echo "create-room-type.js failed. Exiting."
  exit 1
fi

echo "All scripts executed successfully."