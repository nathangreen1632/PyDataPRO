cd ../server || { echo "❌ Failed to cd into server/"; exit 1; }
uvicorn main:app --reload &

cd ../client || { echo "❌ Failed to cd into client/"; exit 1; }
npm run dev
