#!/bin/zsh
set -e

# Nazwa kontenera MongoDB z docker-compose.yml
CONTAINER="rezerwacja_db"

# Dane logowania (zmień jeśli masz inne w docker-compose)
USER=""
PASS=""
DB="rezerwacja"

echo "=== 🔍 Sprawdzanie kolekcji w bazie $DB ==="
docker exec -i $CONTAINER mongosh -u $USER -p $PASS --authenticationDatabase admin <<EOF
use $DB
show collections

print("=== 👤 Users (2 przykłady) ===")
db.users.find().limit(100).pretty()

print("=== 🏨 Rooms (2 przykłady) ===")
db.rooms.find().limit(100).pretty()
EOF
