#!/bin/bash

echo "################"
echo "Parse config and process videos"
echo "################"
echo ""
node parseConfig.js

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
echo "Everything ready, run 'sh start.sh' to start video player"
