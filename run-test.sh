#!/bin/bash
set -e

# Clean up
docker compose down -v
docker compose build

# Start keria 0.1.2
export KERIA_IMAGE_TAG=0.1.2
docker compose pull
docker compose up -d keria

# Start setup script
docker compose up setup

# Stops the keria instance but keeps the volume intact
docker compose down keria

# Run migrations with new version
export KERIA_IMAGE_TAG=0.2.0-dev3
docker compose pull
docker compose run -it --rm --entrypoint /keria/migrate.sh keria

# Start new version
docker compose up -d --force-recreate keria

# Try to connect
docker compose up connect

docker compose logs keria
