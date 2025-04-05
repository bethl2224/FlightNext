#!/bin/bash

# Remove the .next directory to clean up bad Next.js cache
rm -rf .next

rm -rf node_modules
# rm -r package-lock.json
# rm -r yarn.lock
# Force clean the npm cache
npm cache clean --force

# Reinstall npm dependencies
npm install

npm run dev