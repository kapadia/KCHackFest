#!/usr/bin/env bash
set -e
git pull
cd frontend
brunch build
cd ..
rsync -ru frontend/public administrator@10.18.14.2:~/KCHackFest/frontend

