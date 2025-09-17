#!/bin/zsh
set -e

# Nazwa kontenera MongoDB (z docker-compose.yml)
CONTAINER="rezerwacja_db_dev"

# Nazwa bazy zgodna z MONGO_URI w configu
DB="rezerwacje"

echo "=== 🔍 Sprawdzanie kolekcji w bazie $DB ==="
docker exec -i $CONTAINER mongosh <<EOF
use $DB
show collections

print("=== 👤 Users (2 przykłady) ===")
db.users.find().limit(2).pretty()

print("=== 🏨 Rooms (2 przykłady) ===")
db.rooms.find().limit(2).pretty()
EOF
