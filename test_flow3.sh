#!/bin/zsh
set -e

API="http://localhost:3000"

echo "=== 1. Register users ==="
curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","username":"john","password":"Haslo123!"}'
echo
curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ank@example.com","username":"ank","password":"Haslo123!"}'
echo

echo "=== 2. Login users ==="
LOGIN_JOHN=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"Haslo123!"}')
echo "Login John response: $LOGIN_JOHN"
JOHN_TOKEN=$(echo $LOGIN_JOHN | jq -r .token)

LOGIN_ANK=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ank","password":"Haslo123!"}')
echo "Login Ank response: $LOGIN_ANK"
ANK_TOKEN=$(echo $LOGIN_ANK | jq -r .token)

echo "John token: $JOHN_TOKEN"
echo "Ank token: $ANK_TOKEN"

echo "=== 3. John creates two rooms ==="
ROOM1=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $JOHN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Johna 1","body":"Pokój z widokiem","createdBy":"john","createdAt":"2025-09-16T12:00:00Z","startAt":"2025-10-01T12:00:00Z","endsAt":"2025-10-07T12:00:00Z","city":"Gdańsk"}')
echo "Room1: $ROOM1"

ROOM2=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $JOHN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Johna 2","body":"Drugi pokój","createdBy":"john","createdAt":"2025-09-16T12:00:00Z","startAt":"2025-11-01T12:00:00Z","endsAt":"2025-11-07T12:00:00Z","city":"Sopot"}')
echo "Room2: $ROOM2"

echo "=== 4. Ank creates two rooms ==="
ROOM3=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $ANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Anki 1","body":"Pokój z balkonem","createdBy":"ank","createdAt":"2025-09-16T12:00:00Z","startAt":"2025-12-01T12:00:00Z","endsAt":"2025-12-07T12:00:00Z","city":"Kraków"}')
echo "Room3: $ROOM3"

ROOM4=$(curl -s -X POST $API/rooms/newRoom \
  -H "Authorization: $ANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Anki 2","body":"Apartament","createdBy":"ank","createdAt":"2025-09-16T12:00:00Z","startAt":"2026-01-01T12:00:00Z","endsAt":"2026-01-07T12:00:00Z","city":"Warszawa"}')
echo "Room4: $ROOM4"

echo "=== 5. Get all rooms ==="
ALL_ROOMS=$(curl -s -X GET $API/rooms/allRooms -H "Authorization: $JOHN_TOKEN")
echo $ALL_ROOMS | jq .

ROOM_ID_JOHN=$(echo $ALL_ROOMS | jq -r '.rooms[] | select(.createdBy=="john") | ._id' | head -n 1)
ROOM_ID_ANK=$(echo $ALL_ROOMS | jq -r '.rooms[] | select(.createdBy=="ank") | ._id' | head -n 1)

echo "Room John ID: $ROOM_ID_JOHN"
echo "Room Ank ID: $ROOM_ID_ANK"

echo "=== 6. John updates his room ==="
curl -s -X PUT $API/rooms/updateRoom \
  -H "Authorization: $JOHN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"_id":"'$ROOM_ID_JOHN'","title":"Pokoj Johna updated","body":"Nowy opis","createdBy":"john","city":"Sopot"}' | jq .

echo "=== 7. Ank likes John's room ==="
curl -s -X PUT $API/rooms/likeRoom \
  -H "Authorization: $ANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"'$ROOM_ID_JOHN'"}' | jq .

echo "=== 8. Ank dislikes John's room ==="
curl -s -X PUT $API/rooms/dislikeRoom \
  -H "Authorization: $ANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"'$ROOM_ID_JOHN'"}' | jq .

echo "=== 9. John reserves Ank's room ==="
curl -s -X PUT $API/rooms/reserve \
  -H "Authorization: $JOHN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"'$ROOM_ID_ANK'"}' | jq .

echo "=== 10. Ank reserves John's room ==="
curl -s -X PUT $API/rooms/reserve \
  -H "Authorization: $ANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"'$ROOM_ID_JOHN'"}' | jq .

echo "=== 11. Verify John's room ==="
curl -s -X GET $API/rooms/singleRoom/$ROOM_ID_JOHN \
  -H "Authorization: $JOHN_TOKEN" | jq .

echo "=== 12. Verify Ank's room ==="
curl -s -X GET $API/rooms/singleRoom/$ROOM_ID_ANK \
  -H "Authorization: $ANK_TOKEN" | jq .
