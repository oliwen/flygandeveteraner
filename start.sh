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

cd backend
npm install
else
cd backend
fi


echo "################"
echo "Start server"
echo "################"
npm run start