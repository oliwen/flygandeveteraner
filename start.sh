#!/bin/bash

arg="${1:-start}"

if [ "$arg" = "full" ]; then
echo "################"
echo "Download latest"
echo "################"
git pull


echo "################"
echo "Prepare backend"
echo "################"

mv -v frontend/dist/assets backend/src/public
cd backend
npm install
else
cd backend
fi

if [ "$arg" = "full" ] || [ "$arg" = "videos" ]; then
echo ""
echo "################"
echo "Optimize videos and create posters"
echo "################"
echo ""
ts-node scripts/generate-video-and-poster.ts
fi


echo "################"
echo "Start server"
echo "################"
npm run start