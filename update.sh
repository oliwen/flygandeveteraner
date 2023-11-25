#!/bin/bash

echo "################"
echo "Download latest"
echo "################"
echo ""
git pull


echo ""
echo "################"
echo "Prepare backend"
echo "################"
echo ""
cd backend
npm install

echo ""
echo "If you get warnings when updating, try 'git reset --hard HEAD'"