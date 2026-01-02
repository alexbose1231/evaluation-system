#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Frontend Build
echo "Building Frontend..."
cd client
npm install
npm run build
cd ..

# 2. Backend Setup
echo "Installing Backend Dependencies..."
pip install -r backend/requirements.txt
