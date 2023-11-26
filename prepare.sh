#!/bin/bash

echo "################"
echo "Parse config and process videos"
echo "################"
echo ""
node ./scripts/parseConfig.js

echo ""
echo "################"
echo "Prepare frontend"
echo "################"
cd frontend
npm install
npm run build
cd ..

echo ""
echo "################"
echo "Prepare backend"
echo "################"
echo ""
mkdir -p backend/src/public
cp -r frontend/dist/* backend/src/public
echo "Everything ready, copy backend folder to Raspberry Pi"
