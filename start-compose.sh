#!/bin/bash
set -e
docker-compose down -v

docker rmi pp2-app || true

docker compose up 

