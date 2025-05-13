#!/bin/bash

cd "$(dirname "$0")/.." || exit  # force into project root

# Start Vite + FastAPI concurrently
npx concurrently \
  "cd client && npm run dev" \
  "PYTHONPATH=. uvicorn server.main:app --reload"
