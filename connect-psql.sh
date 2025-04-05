#!/bin/bash
set -e
docker exec -it app-db psql -U postgres -d appDB
