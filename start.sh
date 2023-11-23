#!/bin/bash

arg="${1:-start}"

if [ "$arg" = "full" ]; then
echo "################"
echo "Download latest"
echo "################"
git pull

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
rm -rf backend/src/public/assets
rm backend/src/public/index.html
mkdir -p backend/src/public
mkdir -p /backend/src/public/videos/generated
mv -v frontend/dist/index.html backend/src/public
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