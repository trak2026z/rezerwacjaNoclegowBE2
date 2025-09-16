#!/bin/zsh
set -e

API="http://localhost:3000"

echo "=== 1. Register users ==="
curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jan@example.com","username":"jan","password":"Haslo123!"}'
echo
curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ann@example.com","username":"ann","password":"Haslo123!"}'
echo

echo "=== 2. Login users ==="
LOGIN_JAN=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jan","password":"Haslo123!"}')
echo "Login Jan response: $LOGIN_JAN"
JAN_TOKEN=$(echo $LOGIN_JAN | jq -r .token)

LOGIN_ANN=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ann","password":"Haslo123!"}')
echo "Login Ann response: $LOGIN_ANN"
ANN_TOKEN=$(echo $LOGIN_ANN | jq -r .token)

echo "Jan token: $JAN_TOKEN"
echo "Ann token: $ANN_TOKEN"

echo "=== 3. Jan creates two rooms ==="
ROOM1=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $JAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Jana 1","body":"Pokój z widokiem","createdBy":"jan","createdAt":"2025-09-16T12:00:00Z","startAt":"2025-10-01T12:00:00Z","endsAt":"2025-10-07T12:00:00Z","city":"Gdańsk"}')
echo "Room1: $ROOM1"

ROOM2=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $JAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Jana 2","body":"Drugi pokój","createdBy":"jan","createdAt":"2025-09-16T12:00:00Z","startAt":"2025-11-01T12:00:00Z","endsAt":"2025-11-07T12:00:00Z","city":"Sopot"}')
echo "Room2: $ROOM2"

echo "=== 4. Ann creates two rooms ==="
ROOM3=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $ANN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Anny 1","body":"Pokój z balkonem","createdBy":"ann","createdAt":"2025-09-16T12:00:00Z","startAt":"2025-12-01T12:00:00Z","endsAt":"2025-12-07T12:00:00Z","city":"Kraków"}')
echo "Room3: $ROOM3"

ROOM4=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $ANN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Anny 2","body":"Apartament","createdBy":"ann","createdAt":"2025-09-16T12:00:00Z","startAt":"2026-01-01T12:00:00Z","endsAt":"2026-01-07T12:00:00Z","city":"Warszawa"}')
echo "Room4: $ROOM4"

echo "=== 5. Get all rooms ==="
ALL_ROOMS=$(curl -s -X GET $API/rooms/allRooms -H "Authorization: $JAN_TOKEN")
echo $ALL_ROOMS | jq .

ROOM_ID_JAN=$(echo $ALL_ROOMS | jq -r '.rooms[] | select(.createdBy=="jan") | ._id' | head -n 1)
ROOM_ID_ANN=$(echo $ALL_ROOMS | jq -r '.rooms[] | select(.createdBy=="ann") | ._id' | head -n 1)

echo "Room Jan ID: $ROOM_ID_JAN"
echo "Room Ann ID: $ROOM_ID_ANN"

echo "=== 6. Jan updates his room ==="
curl -s -X PUT $API/rooms/updateRoom \
  -H "Authorization: $JAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"_id":"'$ROOM_ID_JAN'","title":"Pokoj Jana updated","body":"Nowy opis","createdBy":"jan","city":"Sopot"}' | jq .

echo "=== 7. Ann likes Jan's room ==="
curl -s -X PUT $API/rooms/likeRoom \
  -H "Authorization: $ANN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"'$ROOM_ID_JAN'"}' | jq .

echo "=== 8. Jan reserves Ann's room ==="
curl -s -X PUT $API/rooms/reserve \
  -H "Authorization: $JAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"'$ROOM_ID_ANN'"}' | jq .

echo "=== 9. Ann deletes her room ==="
curl -s -X DELETE $API/rooms/deleteRoom/$ROOM_ID_ANN \
  -H "Authorization: $ANN_TOKEN" | jq .
