#!/usr/bin/env bash
set -e
git pull
rsync -ru frontend/public administrator@10.18.14.2:~/KCHackFest/frontend

