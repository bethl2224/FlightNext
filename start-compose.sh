#!/bin/bash
set -e
docker-compose down -v

docker rmi pp2-app

docker compose up 

