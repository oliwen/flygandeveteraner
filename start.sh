#!/bin/bash
cd frontend
npm run build
cd ..
rm -rf backend/src/public/assets
rm backend/src/public/index.html
mkdir backend/src/public
mv -v frontend/dist/* backend/src/public
cd backend
ts-node scripts/generate-video-and-poster.ts
npm run start