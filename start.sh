#!/bin/bash

#echo $1

#if [ $1 == 'full' ] 
#then
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
mkdir backend/src/public
mv -v frontend/dist/* backend/src/public
cd backend
npm install
#fi

#if [$1 == 'full'] || [$1 == 'video']
#then
echo ""
echo "################"
echo "Optimize videos and create posters"
echo "################"
echo ""
ts-node scripts/generate-video-and-poster.ts
#fi


echo "################"
echo "Start server"
echo "################"
npm run start