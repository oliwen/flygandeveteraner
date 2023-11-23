#!/bin/bash

echo "################"
echo "Prepare frontend"
echo "################"
cd frontend
npm install
npm run build
cd ..

echo "################"
echo "Prepare backend"
echo "################"
echo ""
mkdir -p backend/src/public
cp -r frontend/dist/* backend/src/public

echo ""
echo "################"
echo "Optimize videos and create posters"
echo "################"
echo ""
cd backend
ts-node scripts/generate-video-and-poster.ts
