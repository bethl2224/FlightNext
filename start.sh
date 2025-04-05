#!/bin/bash
set -e
# Install all required packages via npm
npm install

# Run all migrations
npx prisma migrate dev


if [ $? -ne 0 ]; then
  echo "Migration failed."
  exit 1
fi

echo "Setup complete."