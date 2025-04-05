#!/bin/bash
set -e
# Start the backend server
if ! npm run dev; then
  echo "Failed to start the backend server."
  exit 1
fi